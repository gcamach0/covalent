# Copyright 2021 Agnostiq Inc.
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

from .deps import Deps
from .transport import TransportableObject


class DepsCall(Deps):
    """Deps class to encapsulate python functions to be
    called in the same execution environment as the electron.

    Attributes:
        func: A callable
        args: args list
        kwargs: kwargs dict

    """

    def __init__(self, func=None, args=[], kwargs={}):
        super().__init__(apply_fn=func, apply_args=args, apply_kwargs=kwargs)

    def short_name(self):
        return self.__module__.split("/")[-1]

    def to_dict(self):
        attributes = self.__dict__.copy()
        for k, v in attributes.items():
            attributes[k] = v.to_dict()
        return {"type": "DepsCall", "short_name": self.short_name(), "attributes": attributes}

    def from_dict(self, object_dict):
        if not object_dict:
            return self

        attributes = object_dict.copy()["attributes"]
        for k, v in attributes.items():
            attributes[k] = TransportableObject.from_dict(v)
        self.__dict__ = attributes
        return self
