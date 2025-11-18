# OSINT demo (FastAPI + Next.js)

Приложение из двух сервисов: API/гейт на FastAPI и UI на Next.js. Хранит пользователей (людей) и записи “hello” в PostgreSQL. Есть простой JWT‑логин, gRPC и Kafka для демонстрации событий.

## Стек
- Backend: Python 3.12, FastAPI, SQLAlchemy (async), Alembic, gRPC, Kafka, JWT.
- DB: PostgreSQL (docker-compose, данные в `./bd/data`), драйвер `asyncpg`.
- Frontend: Next.js (App Router), TypeScript, Ant Design, TanStack Query.
- Сборка: Docker, docker-compose (kafka:kraft для события `/hello`).

## Быстрый старт
```bash
docker compose up -d --build
```
- UI: http://localhost:3000  
- API: http://localhost:8000  
- gRPC: localhost:50051  
- Kafka: localhost:9092  

## Сервисы из compose
- `backend`: FastAPI + gRPC. Перед запуском uvicorn выполняет `alembic upgrade head`.
- `frontend`: Next.js на Node 20. `NEXT_PUBLIC_API_BASE=http://backend:8000`.
- `postgres`: Postgres 16, данные на хосте в `./bd/data`.
- `kafka`: Apache Kafka 3.8.0 (KRaft) для отправки события из `/hello`.

## Авторизация и API
- Логин: POST `/login` с `{"username":"admin","password":"admin"}` → Bearer токен.
- Защищённые эндпоинты:  
  - `POST /hello` — создаёт greeting, шлёт событие в Kafka (если доступен).  
  - `GET /greetings` — список greeting'ов.  
  - `POST /people` — создать человека (ФИО, Telegram, фото, заметка).  
  - `GET /people` — список людей.
- gRPC: `hello.HelloService/SayHello` (proto `back/proto/hello.proto`).

## Фронтенд
- Страница `/` c формой логина (требуется для всех действий), “Hello” и CRUD для людей (список с аватаром/фото).
- Настройка API: `NEXT_PUBLIC_API_BASE` через compose или `.env.local` (пример в `front/.env.example`).

## Миграции
- Миграции лежат в `back/alembic/versions`.  
- В контейнере backend: `docker compose exec backend alembic upgrade head`.

## Полезные команды
- Логи backend: `docker compose logs backend --tail 100`
- Логи frontend: `docker compose logs frontend --tail 100`
- Пересборка только backend или frontend: `docker compose up -d --build backend` / `frontend`
