import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="로그인에 사용할 이메일")
    password: str = Field(..., min_length=6, description="비밀번호 (최소 6자 이상)")
    name: str = Field(..., min_length=1, max_length=100, description="사용자 이름 또는 닉네임")
    phone_number: Optional[str] = Field(None, description="전화번호 (선택)")

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
