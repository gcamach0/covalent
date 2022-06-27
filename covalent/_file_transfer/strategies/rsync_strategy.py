from os.path import exists
from subprocess import PIPE, Popen

from transfer_strategy_base import FileTransferStrategy

from covalent._file_transfer import File


class Rsync(FileTransferStrategy):
    def __init__(self, user, host, private_key_path=None):
        self.user = user
        self.private_key_path = private_key_path
        self.host = host

        if self.private_key_path and not exists(self.private_key_path):
            raise FileNotFoundError(
                f"Provided private key ({self.private_key_path}) does not exist. Could not instantiate Rsync File Transfer Strategy. "
            )

    def get_rsync_cmd(self, file: File, transfer_from_remote: bool = False) -> str:
        filepath = file.filepath
        args = ["rsync"]
        if self.private_key_path:
            args.append(f'-e "ssh -i {self.private_key_path}"')
        else:
            args.append("-e ssh")

        remote_path = f"{self.user}@{self.host}:/home/ubuntu"
        local_path = str(filepath)

        if transfer_from_remote:
            args.append(remote_path)
            args.append(local_path)
        else:
            args.append(local_path)
            args.append(remote_path)

        return " ".join(args)

    def download(self, file: File):
        cmd = self.get_rsync_cmd(file, transfer_from_remote=True)
        print(f"Running: {cmd}")
        p = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE)
        output, error = p.communicate()
        if p.returncode != 0:
            print(f"There was an error downloading file {file.filepath}")
            print(f"Return code: {p.returncode}")
            print(f"Output: {output}")
            print(f"Error: {error}")

    def upload(self, file: File):
        cmd = self.get_rsync_cmd(file)
        print(f"Running: {cmd}")
        p = Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE)
        output, error = p.communicate()
        if p.returncode != 0:
            print(f"There was an error uploading file {file.filepath}")
            print(f"Return code: {p.returncode}")
            print(f"Output: {output}")
            print(f"Error: {str(error)}")
