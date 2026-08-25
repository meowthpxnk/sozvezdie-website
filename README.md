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
cp .env.example .env                 # заполните секреты своими значениями
poetry install
poetry run python scripts/generate_jwt_keys.py
poetry run python run.py
```

Docker (prod-профиль):

```bash
cp backend/.test.env.example backend/.test.env   # заполните секреты
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

## Секреты

Не коммитьте:

- `.env`, `.env.local`, `backend/.test.env`
- `backend/jwt_keys/*.pem` (генерируются локально / в entrypoint)

Шаблоны без реальных ключей: `backend/.env.example`, `backend/.test.env.example`, `frontend/.env.example`.

Если ключи уже попадали в git — перевыпустите их в кабинетах CDEK / DaData / YooKassa / VK.
