from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Decoded token data schema"""
    email: Optional[str] = None

class LoginRequest(BaseModel):
    """Login request schema"""
    username: str  # Can be email or username
    password: str
