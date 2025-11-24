from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password: str
    role: str = "customer"
    isCustomer: bool = False
    subscription_plan: Optional[str] = None
    ip_address: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(extra="ignore")

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    isCustomer: bool
    subscription_plan: Optional[str] = None

class ProjectBase(BaseModel):
    title: str
    description: str
    videoUrl: Optional[str] = None
    videoId: Optional[str] = None
    category: str
    featured: bool = False
    isService: bool = False

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(extra="ignore")

class SettingsBase(BaseModel):
    title: str
    bio: str
    skills: List[str]
    discord: str

class Settings(SettingsBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(extra="ignore")

class TestimonialBase(BaseModel):
    content: str
    rating: int = Field(ge=1, le=5)

class TestimonialCreate(TestimonialBase):
    pass

class Testimonial(TestimonialBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    author: str
    role: str = "Müşteri"
    isCustomer: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(extra="ignore")

class VaultBase(BaseModel):
    name: str
    game: str
    key: str
    status: str
    script_content: str = ""

class VaultCreate(VaultBase):
    owner_username: str

class Vault(VaultBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_username: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    model_config = ConfigDict(extra="ignore")

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str