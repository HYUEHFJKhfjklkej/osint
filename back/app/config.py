import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv


class Settings:
    def __init__(self) -> None:
        load_dotenv()
        self.secret_key: str = os.getenv("SECRET_KEY", "super-secret")
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes: int = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )
        self.database_url: str = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://osint:osint@postgres:5432/osint",
        )
        self.app_host: str = os.getenv("APP_HOST", "0.0.0.0")
        self.app_port: int = int(os.getenv("APP_PORT", "8000"))
        self.grpc_host: str = os.getenv("GRPC_HOST", "0.0.0.0")
        self.grpc_port: int = int(os.getenv("GRPC_PORT", "50051"))
        self.kafka_bootstrap_servers: Optional[str] = os.getenv(
            "KAFKA_BOOTSTRAP_SERVERS"
        )
        self.kafka_topic: str = os.getenv("KAFKA_TOPIC", "hello-topic")

    @property
    def kafka_enabled(self) -> bool:
        return bool(self.kafka_bootstrap_servers)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
