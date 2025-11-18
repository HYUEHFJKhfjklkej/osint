import logging
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth import authenticate_user, create_access_token, get_current_user
from app.config import settings
from app.database import get_session
from app.grpc_server import grpc_server
from app.kafka import kafka_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hello World Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    await kafka_client.start()
    await grpc_server.start()


@app.on_event("shutdown")
async def _shutdown() -> None:
    await kafka_client.stop()
    await grpc_server.stop()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/login", response_model=schemas.Token)
async def login(payload: schemas.LoginRequest) -> schemas.Token:
    if not authenticate_user(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(payload.username)
    return schemas.Token(access_token=token)


@app.post("/hello", response_model=schemas.HelloResponse)
async def hello(
    payload: schemas.GreetingCreate,
    current_user: Annotated[schemas.TokenData, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> schemas.HelloResponse:
    greeting = models.Greeting(name=payload.name)
    session.add(greeting)
    await session.commit()
    await session.refresh(greeting)
    await kafka_client.send_hello(payload.name)
    message = f"Hello, {payload.name}! Authenticated as {current_user.username}."
    return schemas.HelloResponse(message=message)


@app.get("/greetings", response_model=list[schemas.GreetingOut])
async def list_greetings(
    current_user: Annotated[schemas.TokenData, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[schemas.GreetingOut]:
    result = await session.execute(select(models.Greeting).order_by(models.Greeting.created_at.desc()))
    greetings = result.scalars().all()
    return [schemas.GreetingOut.model_validate(item) for item in greetings]


@app.post("/people", response_model=schemas.PersonOut, status_code=status.HTTP_201_CREATED)
async def create_person(
    payload: schemas.PersonCreate,
    current_user: Annotated[schemas.TokenData, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> schemas.PersonOut:
    person = models.Person(
        full_name=payload.full_name,
        telegram=payload.telegram,
        photo_url=payload.photo_url,
        note=payload.note,
    )
    session.add(person)
    await session.commit()
    await session.refresh(person)
    return schemas.PersonOut.model_validate(person)


@app.get("/people", response_model=list[schemas.PersonOut])
async def list_people(
    current_user: Annotated[schemas.TokenData, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[schemas.PersonOut]:
    result = await session.execute(select(models.Person).order_by(models.Person.created_at.desc()))
    people = result.scalars().all()
    return [schemas.PersonOut.model_validate(item) for item in people]
