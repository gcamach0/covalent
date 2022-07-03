# copyright 2021 Agnostiq Inc.
#
# This file is part of Covalent.
#
# Licensed under the GNU Affero General Public License 3.0 (the "License").
# A copy of the License may be obtained with this software package or at
#
#      https://www.gnu.org/licenses/agpl-3.0.en.html
#
# Use of this file is prohibited except in compliance with the License. Any
# modifications or derivative works of this file must retain this copyright
# notice, and modified files must contain a notice indicating that they have
# been altered from the originals.
#
# Covalent is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the License for more details.
#
# Relief from the License may be granted by purchasing a commercial license.

"""Class corresponding to computation workflow."""

import inspect
import json
import os
import warnings
from contextlib import redirect_stdout
from copy import deepcopy
from functools import wraps
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, List, Optional, Union

import matplotlib.pyplot as plt
import networkx as nx

import covalent_ui.result_webhook as result_webhook

from .._data_store import DataStoreSession, models
from .._shared_files import logger
from .._shared_files.config import get_config
from .._shared_files.context_managers import active_lattice_manager
from .._shared_files.defaults import _DEFAULT_CONSTRAINT_VALUES
from .._shared_files.utils import (
    get_named_params,
    get_serialized_function_str,
    required_params_passed,
)
from .depsbash import DepsBash
from .depscall import DepsCall
from .depspip import DepsPip
from .transport import TransportableObject, _TransportGraph, encode_metadata

if TYPE_CHECKING:
    from .._results_manager.result import Result
    from ..executor import BaseExecutor

from .._shared_files.utils import (
    get_imports,
    get_serialized_function_str,
    get_timedelta,
    required_params_passed,
)

consumable_constraints = []


app_log = logger.app_log
log_stack_info = logger.log_stack_info


class Lattice:
    """
    A lattice workflow object that holds the work flow graph and is returned by :obj:`lattice <covalent.lattice>` decorator.

    Attributes:
        workflow_function: The workflow function that is decorated by :obj:`lattice <covalent.lattice>` decorator.
        transport_graph: The transport graph which will be the basis on how the workflow is executed.
        metadata: Dictionary of metadata of the lattice.
        post_processing: Boolean to indicate if the lattice is in post processing mode or not.
        kwargs: Keyword arguments passed to the workflow function.
        electron_outputs: Dictionary of electron outputs received after workflow execution.
    """

    def __init__(
        self, workflow_function: Callable, transport_graph: _TransportGraph = None
    ) -> None:
        self.workflow_function = workflow_function
        self.workflow_function_string = get_serialized_function_str(self.workflow_function)
        self.transport_graph = transport_graph or _TransportGraph()
        self.metadata = {}
        self.__name__ = self.workflow_function.__name__
        self.post_processing = False
        self.args = []
        self.kwargs = {}
        self.named_args = {}
        self.named_kwargs = {}
        self.electron_outputs = {}
        self.lattice_imports, self.cova_imports = get_imports(self.workflow_function)
        self.cova_imports.update({"electron"})

        self.workflow_function = TransportableObject.make_transportable(self.workflow_function)

    # To be called after build_graph
    def serialize_to_json(self) -> str:

        attributes = deepcopy(self.__dict__)
        attributes["workflow_function"] = self.workflow_function.to_dict()

        attributes["metadata"] = encode_metadata(self.metadata)
        attributes["transport_graph"] = None
        if self.transport_graph:
            attributes["transport_graph"] = self.transport_graph.serialize_to_json()

        attributes["args"] = []
        attributes["kwargs"] = {}

        for arg in self.args:
            attributes["args"].append(arg.to_dict())
        for k, v in self.kwargs.items():
            attributes["kwargs"][k] = v.to_dict()

        for k, v in self.named_args.items():
            attributes["named_args"][k] = v.to_dict()
        for k, v in self.named_kwargs.items():
            attributes["named_kwargs"][k] = v.to_dict()

        attributes["electron_outputs"] = {}
        for node_name, output in self.electron_outputs.items():
            attributes["electron_outputs"][node_name] = output.to_dict()

        attributes["cova_imports"] = list(self.cova_imports)
        # for k, v in attributes.items():
        #     print(k, type(v))

        return json.dumps(attributes)

    @staticmethod
    def deserialize_from_json(json_data: str) -> None:
        attributes = json.loads(json_data)

        attributes["cova_imports"] = set(attributes["cova_imports"])

        for node_name, object_dict in attributes["electron_outputs"].items():
            attributes["electron_outputs"][node_name] = TransportableObject.from_dict(object_dict)

        for k, v in attributes["named_kwargs"].items():
            attributes["named_kwargs"][k] = TransportableObject.from_dict(v)

        for k, v in attributes["named_args"].items():
            attributes["named_args"][k] = TransportableObject.from_dict(v)

        for k, v in attributes["kwargs"].items():
            attributes["kwargs"][k] = TransportableObject.from_dict(v)

        for i, arg in enumerate(attributes["args"]):
            attributes["args"][i] = TransportableObject.from_dict(arg)

        if attributes["transport_graph"]:
            tg = _TransportGraph()
            tg.deserialize_from_json(attributes["transport_graph"])
            attributes["transport_graph"] = tg

        attributes["workflow_function"] = TransportableObject.from_dict(
            attributes["workflow_function"]
        )

        def dummy_function(x):
            return x

        lat = Lattice(dummy_function)
        lat.__dict__ = attributes
        return lat

    def set_metadata(self, name: str, value: Any) -> None:
        """
        Function to add/edit metadata of given name and value
        to lattice's metadata.

        Args:
            name: Name of the metadata to be added/edited.
            value: Value of the metadata to be added/edited.

        Returns:
            None
        """

        self.metadata[name] = value

    def get_metadata(self, name: str) -> Any:
        """
        Get value of the metadata of given name.

        Args:
            name: Name of the metadata whose value is needed.

        Returns:
            value: Value of the metadata of given name.

        Raises:
            KeyError: If metadata of given name is not present.
        """

        return self.metadata.get(name, None)

    def build_graph(self, *args, **kwargs) -> None:
        """
        Builds the transport graph for the lattice by executing the workflow
        function which will trigger the call of all underlying electrons and
        they will get added to the transport graph for later execution.

        Also redirects any print statements inside the lattice function to null
        and ignores any exceptions caused while executing the function.

        GRAPH WILL NOT BE BUILT AFTER AN EXCEPTION HAS OCCURRED.

        Args:
            *args: Positional arguments to be passed to the workflow function.
            **kwargs: Keyword arguments to be passed to the workflow function.

        Returns:
            None
        """

        self.args = [TransportableObject.make_transportable(arg) for arg in args]
        self.kwargs = {k: TransportableObject.make_transportable(v) for k, v in kwargs.items()}

        self.transport_graph.reset()

        workflow_function = self.workflow_function.get_deserialized()

        named_args, named_kwargs = get_named_params(workflow_function, self.args, self.kwargs)
        self.named_args = named_args
        self.named_kwargs = named_kwargs

        new_args = [v.get_deserialized() for _, v in named_args.items()]
        new_kwargs = {k: v.get_deserialized() for k, v in named_kwargs.items()}

        with redirect_stdout(open(os.devnull, "w")):
            with active_lattice_manager.claim(self):
                try:
                    workflow_function(*new_args, **new_kwargs)
                except Exception:
                    warnings.warn(
                        "Please make sure you are not manipulating an object inside the lattice."
                    )
                    raise

    def draw_inline(self, ax: plt.Axes = None, *args, **kwargs) -> None:
        """
        Rebuilds the graph according to the kwargs passed and draws it on the given axis.
        If no axis is given then a new figure is created.

        Note: This function does `plt.show()` at the end.

        Args:
            ax: Axis on which the graph is to be drawn.
            *args: Positional arguments to be passed to build the graph.
            **kwargs: Keyword arguments to be passed to build the graph.

        Returns:
            None
        """

        self.build_graph(**kwargs)

        main_graph = self.transport_graph.get_internal_graph_copy()

        node_labels = nx.get_node_attributes(main_graph, "name")

        if ax is None:
            _, ax = plt.subplots()
        main_graph.graph["graph"] = {"rankdir": "TD"}
        main_graph.graph["node"] = {"shape": "circle"}
        main_graph.graph["edges"] = {"arrowsize": "4.0"}

        prog = "dot"
        args = "-Gnodesep=1 -Granksep=2 -Gpad=0.1 -Grankdir=TD"
        root = None
        pos = nx.drawing.nx_agraph.graphviz_layout(main_graph, prog=prog, root=root, args=args)

        # Print the node number in the label as `[node number]`
        for key, value in node_labels.items():
            node_labels[key] = "[" + str(key) + "]\n" + value
        edge_labels = nx.get_edge_attributes(main_graph, "edge_name")
        nx.draw(
            main_graph,
            pos=pos,
            labels=node_labels,
            node_color="w",
            node_size=700,
            node_shape="s",
        )
        nx.draw_networkx_edge_labels(main_graph, pos, edge_labels)
        plt.margins(x=0.4)
        plt.tight_layout()
        return ax

    def persist(self, ds: DataStoreSession, update: bool):
        self.transport_graph.persist(ds, update)

    def draw(self, *args, **kwargs) -> None:
        """
        Generate lattice graph and display in UI taking into account passed in
        arguments.

        Args:
            *args: Positional arguments to be passed to build the graph.
            **kwargs: Keyword arguments to be passed to build the graph.

        Returns:
            None
        """

        self.build_graph(*args, **kwargs)
        result_webhook.send_draw_request(self)

    def __call__(self, *args, **kwargs):
        """Execute lattice as an ordinary function for testing purposes."""

        workflow_function = self.workflow_function.get_deserialized()
        return workflow_function(*args, **kwargs)

    def check_constraint_specific_sum(self, constraint_name: str, node_list: List[dict]) -> bool:
        """
        Function to check whether the sum of the given constraint in each electron
        are within the constraint specified for the lattice.

        Args:
            constraint_name: Name of the constraint to be checked, e.g budget, timelimit, etc.
            node_list: List of nodes to be checked.
        Returns:
            True if the sum of constraints are within the constraint specified for the lattice,
            else False.
        """

        constraint_list = [
            node["metadata"][constraint_name] if node["metadata"] else None for node in node_list
        ]

        parameter_node_id = [i for i, x in enumerate(constraint_list) if not x]

        if constraint_name == "budget":
            constraint_sum = sum(
                cl for i, cl in enumerate(constraint_list) if i not in parameter_node_id
            )

            return constraint_sum <= self.get_metadata(constraint_name)

        elif constraint_name == "time_limit":
            from datetime import timedelta

            order = self.transport_graph.get_topologically_sorted_graph()

            delta_list_parallel = []
            for node_set in order:
                node_set_time_deltas = [
                    get_timedelta(constraint_list[n])
                    for n in node_set
                    if n not in parameter_node_id
                ]
                if node_set_time_deltas:
                    delta_list_parallel.append(max(node_set_time_deltas))

            return sum(delta_list_parallel, timedelta()) <= get_timedelta(
                self.get_metadata(constraint_name)
            )

    def check_consumable(self) -> None:
        """
        Function to check whether all consumable constraints in all the nodes are
        within the limits of what is specified for the lattice.

        Args:
            None
        Returns:
            None
        Raises:
            ValueError: If the sum of consumable constraints in all the nodes are
                        not within the total limit of the lattice.
        """

        graph_copy = self.transport_graph.get_internal_graph_copy()
        data = nx.readwrite.node_link_data(graph_copy)

        for constraint in consumable_constraints:
            if not self.check_constraint_specific_sum(constraint, data["nodes"]):
                raise ValueError(
                    "The sum of all electron {} constraints is greater than the lattice {} constraint".format(
                        constraint, constraint
                    )
                )

    def dispatch(self, *args, **kwargs) -> str:
        """
        DEPRECATED: Function to dispatch workflows.

        Args:
            *args: Positional arguments for the workflow
            **kwargs: Keyword arguments for the workflow

        Returns:
            Dispatch id assigned to job
        """

        app_log.warning(
            "workflow.dispatch(your_arguments_here) is deprecated and may get removed without notice in future releases. Please use covalent.dispatch(workflow)(your_arguments_here) instead.",
            exc_info=DeprecationWarning,
        )

        from .._dispatcher_plugins import local_dispatch

        return local_dispatch(self)(*args, **kwargs)

    def dispatch_sync(self, *args, **kwargs) -> "Result":
        """
        DEPRECATED: Function to dispatch workflows synchronously by waiting for the result too.

        Args:
            *args: Positional arguments for the workflow
            **kwargs: Keyword arguments for the workflow

        Returns:
            Result of workflow execution
        """

        app_log.warning(
            "workflow.dispatch_sync(your_arguments_here) is deprecated and may get removed without notice in future releases. Please use covalent.dispatch_sync(workflow)(your_arguments_here) instead.",
            exc_info=DeprecationWarning,
        )

        from .._dispatcher_plugins import local_dispatch_sync

        return local_dispatch_sync(self)(*args, **kwargs)


def lattice(
    _func: Optional[Callable] = None,
    *,
    backend: Optional[str] = None,
    executor: Optional[
        Union[List[Union[str, "BaseExecutor"]], Union[str, "BaseExecutor"]]
    ] = _DEFAULT_CONSTRAINT_VALUES["executor"],
    results_dir: Optional[str] = get_config("dispatcher.results_dir"),
    workflow_executor: Optional[
        Union[List[Union[str, "BaseExecutor"]], Union[str, "BaseExecutor"]]
    ] = _DEFAULT_CONSTRAINT_VALUES["workflow_executor"],
    # Add custom metadata fields here
    deps_bash: Union[DepsBash, list, str] = _DEFAULT_CONSTRAINT_VALUES["deps"].get("bash", None),
    deps_pip: Union[DepsPip, list] = _DEFAULT_CONSTRAINT_VALUES["deps"].get("pip", None),
    call_before: Union[List[DepsCall], DepsCall] = _DEFAULT_CONSTRAINT_VALUES["call_before"],
    call_after: Union[List[DepsCall], DepsCall] = _DEFAULT_CONSTRAINT_VALUES["call_after"],
    # e.g. schedule: True, whether to use a custom scheduling logic or not
) -> Lattice:
    """
    Lattice decorator to be called upon a function. Returns a new `Lattice <covalent._workflow.lattice.Lattice>` object.

    Args:
        _func: function to be decorated

    Keyword Args:
        backend: DEPRECATED: Same as `executor`.
        executor: Alternative executor object to be used in the execution of each node. If not passed, the local
            executor is used by default.
        results_dir: Directory to store the results
        deps_bash: An optional DepsBash object specifying a list of shell commands to run before `_func`
        deps_pip: An optional DepsPip object specifying a list of PyPI packages to install before running `_func`
        call_before: An optional list of DepsCall objects specifying python functions to invoke before the electron
        call_after: An optional list of DepsCall objects specifying python functions to invoke after the electron

    Returns:
        :obj:`Lattice <covalent._workflow.lattice.Lattice>` : Lattice object inside which the decorated function exists.
    """

    if backend:
        app_log.warning(
            "backend is deprecated and will be removed in a future release. Please use executor keyword instead.",
            exc_info=DeprecationWarning,
        )
        executor = backend

    results_dir = str(Path(results_dir).expanduser().resolve())

    deps = {}

    if isinstance(deps_bash, DepsBash):
        deps["bash"] = deps_bash
    if isinstance(deps_bash, list) or isinstance(deps_bash, str):
        deps["bash"] = DepsBash(commands=deps_bash)

    if isinstance(deps_pip, DepsPip):
        deps["pip"] = deps_pip
    if isinstance(deps_pip, list):
        deps["pip"] = DepsPip(packages=deps_pip)

    if isinstance(call_before, DepsCall):
        call_before = [call_before]

    if isinstance(call_after, DepsCall):
        call_after = [call_after]

    constraints = {
        "executor": executor,
        "results_dir": results_dir,
        "workflow_executor": workflow_executor,
        "deps": deps,
        "call_before": call_before,
        "call_after": call_after,
    }

    def decorator_lattice(func=None):
        @wraps(func)
        def wrapper_lattice(*args, **kwargs):
            lattice_object = Lattice(workflow_function=func)
            for k, v in constraints.items():
                lattice_object.set_metadata(k, v)
            lattice_object.transport_graph.lattice_metadata = lattice_object.metadata
            lattice_object.__doc__ = func.__doc__
            return lattice_object

        return wrapper_lattice()

    if _func is None:  # decorator is called with arguments
        return decorator_lattice
    else:  # decorator is called without arguments
        return decorator_lattice(_func)
