import bcrypt
from typing import Optional

def get_password_hash(password: str) -> str:
    """평문 비밀번호를 bcrypt 해시로 변환합니다."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """평문 비밀번호와 bcrypt 해시를 비교 검증합니다."""
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
