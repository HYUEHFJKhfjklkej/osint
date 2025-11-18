import logging
from typing import Optional

from aiokafka import AIOKafkaProducer

from app.config import settings

logger = logging.getLogger(__name__)


class KafkaClient:
    def __init__(self) -> None:
        self.producer: Optional[AIOKafkaProducer] = None

    async def start(self) -> None:
        if not settings.kafka_enabled:
            logger.info("Kafka disabled (no bootstrap servers set)")
            return
        self.producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
        try:
            await self.producer.start()
            logger.info("Kafka producer started -> %s", settings.kafka_bootstrap_servers)
        except Exception as exc:
            logger.warning("Kafka producer not started: %s", exc)
            self.producer = None

    async def stop(self) -> None:
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka producer stopped")

    async def send_hello(self, name: str) -> None:
        if not self.producer:
            return
        try:
            await self.producer.send_and_wait(settings.kafka_topic, value=name.encode())
        except Exception as exc:
            logger.warning("Failed to publish to Kafka: %s", exc)


kafka_client = KafkaClient()
