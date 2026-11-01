from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from auth import USER_DB, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    u_key = req.username.strip().lower()
    user_record = USER_DB.get(u_key)
    if not user_record or not verify_password(req.password, user_record["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = create_access_token({"sub": u_key, "role": user_record["role"]})
    user_data = user_record.copy()
    user_data.pop("password_hash", None)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
