#!/usr/bin/env python3
"""Generate RSA JWT key pair under backend/jwt_keys/ (gitignored)."""

from __future__ import annotations

from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

ROOT = Path(__file__).resolve().parents[1]
KEYS_DIR = ROOT / "jwt_keys"
PRIVATE_PATH = KEYS_DIR / "private.pem"
PUBLIC_PATH = KEYS_DIR / "public.pem"


def main() -> None:
    KEYS_DIR.mkdir(parents=True, exist_ok=True)
    if PRIVATE_PATH.exists() and PUBLIC_PATH.exists():
        print(f"JWT keys already exist in {KEYS_DIR}")
        return

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    PRIVATE_PATH.write_bytes(
        private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    PUBLIC_PATH.write_bytes(
        private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    )
    print(f"Generated JWT keys in {KEYS_DIR}")


if __name__ == "__main__":
    main()
