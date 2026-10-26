from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.core.security import get_password_hash, verify_password

router = APIRouter()

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="회원가입",
    description="이메일, 비밀번호, 이름, 전화번호(선택)를 입력받아 새로운 회원을 등록합니다."
)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # 1. 이메일 중복 검사
    stmt = select(User).where(User.email == user_in.email)
    existing_user = db.execute(stmt).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일 주소입니다."
        )

    # 2. 비밀번호 단방향 해싱
    hashed_pwd = get_password_hash(user_in.password)

    # 3. 신규 사용자 생성
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        name=user_in.name,
        phone_number=user_in.phone_number,
        auth_provider="LOCAL",
        is_active=True,
        role="USER"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="로그인",
    description="이메일과 비밀번호를 검증하여 로그인합니다."
)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    # 1. 사용자 조회
    stmt = select(User).where(User.email == login_in.email)
    user = db.execute(stmt).scalar_one_or_none()

    # 2. 존재 여부 및 비밀번호 검증
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 일치하지 않습니다."
        )

    # 3. 계정 활성화 상태 검증
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화되었거나 정지된 계정입니다. 관리자에게 문의하세요."
        )

    return user
