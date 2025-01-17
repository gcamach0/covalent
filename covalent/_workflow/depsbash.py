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
from typing import List, Union

from .deps import Deps
from .depscall import DepsCall


def apply_bash_commands(commands):
    for cmd in commands:
        proc = subprocess.run(
            cmd, stdin=subprocess.DEVNULL, shell=True, capture_output=True, check=True, text=True
        )


class DepsBash(Deps):
    """Deps class to encapsulate Bash dependencies for an electron.

    The specified commands will be executed as subprocesses in the
    same environment as the electron.

    Attributes:
        commands: A list of bash commands to execute before the electron runs.

    """

    def __init__(self, commands: Union[List, str]):
        if isinstance(commands, str):
            self.commands = [commands]
        else:
            self.commands = commands

        super().__init__(apply_fn=apply_bash_commands, apply_args=[self.commands])
