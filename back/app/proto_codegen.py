import logging
import sys
from pathlib import Path

from grpc_tools import protoc


logger = logging.getLogger(__name__)


def ensure_proto_generated() -> None:
    """Generate hello_pb2*.py if they are missing (useful in local dev)."""
    target = Path(__file__).with_name("hello_pb2.py")
    grpc_target = Path(__file__).with_name("hello_pb2_grpc.py")
    if target.exists() and grpc_target.exists():
        return

    project_root = Path(__file__).resolve().parent.parent
    proto_dir = project_root / "proto"
    proto_file = proto_dir / "hello.proto"

    logger.info("Generating gRPC stubs from %s", proto_file)
    protoc.main(
        [
            "protoc",
            f"-I{proto_dir}",
            f"--python_out={Path(__file__).parent}",
            f"--grpc_python_out={Path(__file__).parent}",
            str(proto_file),
        ]
    )
    # Ensure local imports inside generated files can resolve without installation
    sys_path = Path(__file__).resolve().parent
    if str(sys_path) not in sys.path:
        sys.path.insert(0, str(sys_path))
