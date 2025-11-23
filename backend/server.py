from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from pydantic import BaseModel 
import auth 
from models import (
    UserCreate, UserInDB, UserResponse,
    Project, ProjectCreate, 
    Settings, SettingsBase, 
    Testimonial, TestimonialCreate
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

users_collection = db.users
projects_collection = db.projects
settings_collection = db.settings
testimonials_collection = db.testimonials
messages_collection = db.messages

app = FastAPI()
api_router = APIRouter(prefix="/api")

@api_router.post("/register")
async def register_user(user_data: UserCreate, request: Request):
    client_ip = request.client.host

    if await users_collection.find_one({"ip_address": client_ip}):
        raise HTTPException(status_code=400, detail="Bu IP adresinden zaten bir hesap oluşturulmuş.")

    if await users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış")
    
    hashed_password = auth.get_password_hash(user_data.password)
    
    user_in_db = UserInDB(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password,
        ip_address=client_ip,
        role="customer",
        isCustomer=False
    )
    
    doc = user_in_db.model_dump(exclude_none=True)
    doc['createdAt'] = doc['createdAt'].isoformat()
    doc['updatedAt'] = doc['updatedAt'].isoformat()

    await users_collection.insert_one(doc)
    return {"message": "Kullanıcı başarıyla kaydedildi"}

@api_router.post("/login")
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await users_collection.find_one({"username": form_data.username})

    if user is None or not auth.verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    
    access_token = auth.create_access_token(
        data={
            "sub": user["username"], 
            "role": user.get("role", "customer"),
            "isCustomer": user.get("isCustomer", False) 
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    return await projects_collection.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/projects", response_model=Project)
async def create_project(project_in: ProjectCreate):
    doc = project_in.model_dump()
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    doc['updatedAt'] = datetime.now(timezone.utc).isoformat()
    await projects_collection.insert_one(doc)
    return Project(**doc)

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, project_data: ProjectCreate):
    doc = project_data.model_dump()
    doc['updatedAt'] = datetime.now(timezone.utc).isoformat()
    result = await projects_collection.update_one({"id": project_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    return {"message": "Proje güncellendi"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await projects_collection.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    return {"message": "Proje silindi"}

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await settings_collection.find_one({}, {"_id": 0})
    if not settings:
        return Settings(title="Varsayılan", bio="", skills=[], discord="")
    return settings

@api_router.post("/settings", response_model=Settings)
async def update_settings(settings_in: SettingsBase):
    existing = await settings_collection.find_one({})
    doc = settings_in.model_dump()
    doc['updatedAt'] = datetime.now(timezone.utc).isoformat()
    
    if existing:
        await settings_collection.update_one({"_id": existing["_id"]}, {"$set": doc})
    else:
        await settings_collection.insert_one(doc)
    return Settings(**doc)

@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    return await testimonials_collection.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(
    testimonial_in: TestimonialCreate, 
    current_user: Annotated[dict, Depends(auth.get_current_user)]
):
    username = current_user.get("sub")
    
    testimonial = Testimonial(
        **testimonial_in.model_dump(),
        userId=str(username),
        author=str(username),
        role=current_user.get("role", "customer"),
        isCustomer=current_user.get("isCustomer", False)
    )
    doc = testimonial.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await testimonials_collection.insert_one(doc)
    return testimonial

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    result = await testimonials_collection.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    return {"message": "Yorum silindi"}

class UserStatusUpdate(BaseModel):
    isCustomer: bool

@api_router.get("/users")
async def get_users():
    return await users_collection.find({}, {"_id": 0, "password": 0}).to_list(1000)

@api_router.put("/users/{username}/status")
async def update_user_status(username: str, status: UserStatusUpdate):
    result = await users_collection.update_one(
        {"username": username}, 
        {"$set": {"isCustomer": status.isCustomer}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı durumu güncellendi"}

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str

@api_router.post("/contact")
async def send_contact_message(msg: ContactMessage):
    doc = msg.model_dump()
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    await messages_collection.insert_one(doc)
    return {"message": "Mesajınız iletildi"}

@api_router.get("/")
async def root():
    return {"message": "API Çalışıyor"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)