import uuid
from datetime import datetime
from typing import Optional
import re
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="로그인에 사용할 이메일")
    password: str = Field(..., min_length=6, description="비밀번호 (최소 6자 이상)")
    name: str = Field(..., min_length=1, max_length=100, description="사용자 이름 또는 닉네임")
    phone_number: Optional[str] = Field(None, description="전화번호 (예: 010-1234-5678)")

    @field_validator("phone_number")
    @classmethod
    def validate_and_normalize_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        # 숫자만 추출
        clean = re.sub(r"[^\d]", "", v)
        # 한국 휴대전화 번호 검증 (010, 011, 016, 017, 018, 019 등 10~11자리)
        if not re.match(r"^01[016789]\d{7,8}$", clean):
            raise ValueError("올바른 휴대전화 번호 형식이 아닙니다. (예: 010-1234-5678)")
        # 010-XXXX-XXXX 포맷으로 정규화하여 저장
        if len(clean) == 11:
            return f"{clean[:3]}-{clean[3:7]}-{clean[7:]}"
        elif len(clean) == 10:
            return f"{clean[:3]}-{clean[3:6]}-{clean[6:]}"
        return clean

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="가입된 이메일")
    password: str = Field(..., description="비밀번호")

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    phone_number: Optional[str] = None
    auth_provider: str
    profile_image_url: Optional[str] = None
    is_active: bool
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
