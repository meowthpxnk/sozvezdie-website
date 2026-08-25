# sozvezdie-website

Монорепозиторий интернет-магазина «Созвездие».

Код перенесён из:
- [sozvezdie-backend](https://github.com/meowthpxnk/sozvezdie-backend) → `backend/`
- [sozvezdie-frontend](https://github.com/meowthpxnk/sozvezdie-frontend) → `frontend/`

## Структура

```
.
├── backend/     # FastAPI + Poetry (API, workers, Docker)
├── frontend/    # Next.js (App Router)
└── docker-compose.yml
```

## Быстрый старт

### Инфраструктура (Postgres, Redis, RabbitMQ, MinIO)

```bash
docker network create nginx_appnet   # один раз
docker compose up -d redis postgres rabbitmq minio minio-init
```

### Backend

```bash
cd backend
cp .env.example .env                 # при необходимости поправьте значения
poetry install
poetry run python run.py
```

Docker (prod-профиль):

```bash
docker compose --profile prod up -d --build app worker
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Docker:

```bash
docker compose --profile frontend up -d --build frontend
```

## Переменные окружения

- Backend: `backend/.env.example`, для Docker — `backend/.test.env`
- Frontend: `frontend/.env.example` → `.env.local`

Не коммитьте `.env` / `.env.local` и логи.
