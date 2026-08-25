#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f jwt_keys/private.pem || ! -f jwt_keys/public.pem ]]; then
  python scripts/generate_jwt_keys.py
fi

alembic upgrade head
python run.py
