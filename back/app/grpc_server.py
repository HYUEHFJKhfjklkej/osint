import logging
from typing import Optional

import grpc

from app.config import settings
from app.proto_codegen import ensure_proto_generated

ensure_proto_generated()

from app import hello_pb2, hello_pb2_grpc  # noqa: E402

logger = logging.getLogger(__name__)


class HelloService(hello_pb2_grpc.HelloServiceServicer):
    async def SayHello(self, request: hello_pb2.HelloRequest, context: grpc.aio.ServicerContext) -> hello_pb2.HelloReply:
        message = f"Hello (gRPC), {request.name}!"
        return hello_pb2.HelloReply(message=message)


class GrpcServer:
    def __init__(self) -> None:
        self.server: Optional[grpc.aio.Server] = None

    async def start(self) -> None:
        server = grpc.aio.server()
        hello_pb2_grpc.add_HelloServiceServicer_to_server(HelloService(), server)
        listen_addr = f"{settings.grpc_host}:{settings.grpc_port}"
        server.add_insecure_port(listen_addr)
        await server.start()
        logger.info("gRPC server started on %s", listen_addr)
        self.server = server

    async def stop(self) -> None:
        if self.server:
            await self.server.stop(grace=None)
            logger.info("gRPC server stopped")


grpc_server = GrpcServer()
