"""
Authentication and Session Security Module
Course: Operating Systems and Systems Programming (25CS2104E)
"""
import hashlib
import os
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.environ.get("OSSP_SECRET_KEY", "ossp_kernel_secret_key_2026_secure_token_salt")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

security = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${hashed}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    try:
        salt, expected_hash = stored_hash.split('$', 1)
        actual_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

# Backend secure user store - credentials are validated strictly on server
USER_DB = {
    "admin": {
        "username": "admin",
        "full_name": "System Administrator",
        "role": "OS_SUPERVISOR",
        "password_hash": hash_password("os_admin_2026!", salt="ossp_salt_fixed_init_2026"),
        "created_at": "2026-09-20 00:00:00"
    },
    "operator": {
        "username": "operator",
        "full_name": "Console Operator",
        "role": "OS_OPERATOR",
        "password_hash": hash_password("os_admin_2026!", salt="ossp_salt_fixed_init_2026"),
        "created_at": "2026-09-20 00:00:00"
    },
    "root": {
        "username": "root",
        "full_name": "Kernel Supervisor",
        "role": "ROOT_ADMIN",
        "password_hash": hash_password("os_admin_2026!", salt="ossp_salt_fixed_init_2026"),
        "created_at": "2026-09-20 00:00:00"
    }
}

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    username: str = payload.get("sub")
    if username is None or username not in USER_DB:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or invalid session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = USER_DB[username].copy()
    user.pop("password_hash", None)
    return user
