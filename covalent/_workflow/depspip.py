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

import subprocess
import tempfile
from pathlib import Path
from typing import List, Union

from .deps import Deps


def apply_pip_deps(pkgs: [] = [], requirements_content: str = ""):
    if requirements_content:
        reqs_filename = ""
        with tempfile.NamedTemporaryFile("w", delete=False) as f:
            f.write(requirements_content)
            reqs_filename = f.name
        cmd = f"pip install --no-input -r {reqs_filename}".split()

    else:
        pkg_list = " ".join(pkgs)
        cmd = f"pip install --no-input {pkg_list}".split()

    subprocess.run(cmd, stdin=subprocess.DEVNULL, check=True, capture_output=True)


class DepsPip(Deps):
    """A specification of Pip packages to be installed

    Attributes:
        packages: A list of PyPI packages to install
        reqs_path: Path to requirements.txt (overrides `packages`)

    These packages are installed in an electron's execution
    environment just before the electron is run.

    """

    def __init__(self, packages: Union[List, str] = [], reqs_path: str = ""):
        if isinstance(packages, str):
            self.packages = [packages]
        else:
            self.packages = packages

        self.reqs_path = reqs_path
        self.requirements_content = ""

        if self.reqs_path:
            with open(self.reqs_path, "r") as f:
                self.requirements_content = f.read()

        apply_args = [self.packages, self.requirements_content]

        super().__init__(apply_fn=apply_pip_deps, apply_args=apply_args)
