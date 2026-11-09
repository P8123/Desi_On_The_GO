from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid
import re

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    current_city: Optional[str] = None
    cities_lived: Optional[List[str]] = []
    mother_tongue: str
    profile_photo_url: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    current_city: Optional[str] = None
    cities_lived: Optional[List[str]] = None
    mother_tongue: str
    profile_photo_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PostCreate(BaseModel):
    restaurant_name: str
    state: str
    city: str
    description: str
    keywords: List[str] = []
    map_link: Optional[str] = None
    photos: List[str] = []

class CommentResponse(BaseModel):
    id: UUID
    author: str  # Author's full name
    text: str

    model_config = ConfigDict(from_attributes=True)

class PostResponse(BaseModel):
    id: UUID
    author_id: UUID
    authorName: str
    authorPhoto: Optional[str] = None
    motherTongue: str
    restaurantName: str
    state: str
    city: str
    description: str
    keywords: List[str]
    mapLink: Optional[str] = None
    photos: List[str]
    likes: int
    liked: bool
    comments: List[CommentResponse]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse # Or map keys if camelCase is required, but standard is fine if frontend handles it

class CommentCreate(BaseModel):
    text: str