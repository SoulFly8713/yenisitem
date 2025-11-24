from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Annotated, Optional
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from pydantic import BaseModel 
import auth 
from models import (
    UserCreate, UserInDB, UserResponse,
    Project, ProjectCreate, 
    Settings, SettingsBase, 
    Testimonial, TestimonialCreate,
    Vault, VaultCreate, ContactMessage
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
vaults_collection = db.vaults

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- AUTH & USER ---
@api_router.post("/register")
async def register_user(user_data: UserCreate, request: Request):
    client_ip = request.client.host
    if await users_collection.find_one({"ip_address": client_ip}):
        raise HTTPException(status_code=400, detail="Bu IP ile zaten kayıt olunmuş.")
    if await users_collection.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Kullanıcı adı dolu.")
    
    hashed_password = auth.get_password_hash(user_data.password)
    user_in_db = UserInDB(
        username=user_data.username, email=user_data.email,
        password=hashed_password, ip_address=client_ip,
        role="customer", isCustomer=False, subscription_plan="Yok"
    )
    doc = user_in_db.model_dump(exclude_none=True)
    doc['createdAt'] = doc['createdAt'].isoformat()
    doc['updatedAt'] = doc['updatedAt'].isoformat()
    await users_collection.insert_one(doc)
    return {"message": "Kayıt başarılı"}

@api_router.post("/login")
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await users_collection.find_one({"username": form_data.username})
    if user is None or not auth.verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Hatalı giriş")
    
    access_token = auth.create_access_token(
        data={
            "sub": user["username"], 
            "role": user.get("role", "customer"),
            "isCustomer": user.get("isCustomer", False) 
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[dict, Depends(auth.get_current_user)]):
    user = await users_collection.find_one({"username": current_user["sub"]})
    if not user: raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return UserResponse(**user)

class UserUpdateModel(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    old_password: Optional[str] = None

@api_router.put("/users/me/update")
async def update_self(
    user_data: UserUpdateModel, 
    current_user: Annotated[dict, Depends(auth.get_current_user)]
):
    user_in_db = await users_collection.find_one({"username": current_user["sub"]})
    update_fields = {}

    if user_data.email:
        email = user_data.email.strip().lower()
        allowed = ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com", "@icloud.com", "@yandex.com"]
        if not any(email.endswith(dom) for dom in allowed):
            raise HTTPException(status_code=400, detail="Geçersiz mail sağlayıcısı.")
        update_fields["email"] = email
        
    if user_data.password:
        if not user_data.old_password:
            raise HTTPException(status_code=400, detail="Mevcut şifrenizi girmelisiniz.")
        if not auth.verify_password(user_data.old_password, user_in_db["password"]):
            raise HTTPException(status_code=400, detail="Mevcut şifreniz hatalı.")
        update_fields["password"] = auth.get_password_hash(user_data.password)

    if not update_fields: raise HTTPException(status_code=400, detail="Veri yok")

    await users_collection.update_one({"username": current_user["sub"]}, {"$set": update_fields})
    return {"message": "Profil güncellendi"}

# --- ADMIN USER MANAGE ---
class UserStatusUpdate(BaseModel):
    isCustomer: bool
    subscription_plan: Optional[str] = None

@api_router.get("/users")
async def get_users():
    return await users_collection.find({}, {"_id": 0, "password": 0}).to_list(1000)

@api_router.put("/users/{username}/status")
async def update_user_status(username: str, status: UserStatusUpdate):
    update_data = {"isCustomer": status.isCustomer}
    if status.subscription_plan == "Yok": update_data["subscription_plan"] = None
    elif status.subscription_plan is not None: update_data["subscription_plan"] = status.subscription_plan
    
    result = await users_collection.update_one({"username": username}, {"$set": update_data})
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="Bulunamadı")
    return {"message": "Güncellendi"}

# --- PROJECTS ---
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
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="Bulunamadı")
    return {"message": "Güncellendi"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await projects_collection.delete_one({"id": project_id})
    if result.deleted_count == 0: raise HTTPException(status_code=404, detail="Bulunamadı")
    return {"message": "Silindi"}

# --- SETTINGS ---
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await settings_collection.find_one({}, {"_id": 0})
    if not settings: return Settings(title="Varsayılan", bio="", skills=[], discord="")
    return settings

@api_router.post("/settings", response_model=Settings)
async def update_settings(settings_in: SettingsBase):
    existing = await settings_collection.find_one({})
    doc = settings_in.model_dump()
    doc['updatedAt'] = datetime.now(timezone.utc).isoformat()
    if existing: await settings_collection.update_one({"_id": existing["_id"]}, {"$set": doc})
    else: await settings_collection.insert_one(doc)
    return Settings(**doc)

# --- TESTIMONIALS ---
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    return await testimonials_collection.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(
    testimonial_in: TestimonialCreate, 
    current_user: Annotated[dict, Depends(auth.get_current_user)]
):
    username = current_user.get("sub", "Anonim")
    if await testimonials_collection.find_one({"userId": str(username)}):
        raise HTTPException(status_code=400, detail="Zaten bir yorumunuz var.")

    testimonial = Testimonial(
        **testimonial_in.model_dump(),
        userId=str(username), author=str(username),
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
    if result.deleted_count == 0: raise HTTPException(status_code=404, detail="Bulunamadı")
    return {"message": "Silindi"}

# --- VAULTS ---
@api_router.get("/vaults/user/{username}", response_model=List[Vault])
async def get_user_vaults(username: str):
    return await vaults_collection.find({"owner_username": username}, {"_id": 0}).to_list(1000)

@api_router.post("/vaults", response_model=Vault)
async def create_vault(vault_in: VaultCreate):
    vault = Vault(**vault_in.model_dump())
    doc = vault.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await vaults_collection.insert_one(doc)
    return vault

@api_router.delete("/vaults/{vault_id}")
async def delete_vault(vault_id: str):
    result = await vaults_collection.delete_one({"id": vault_id})
    if result.deleted_count == 0: raise HTTPException(status_code=404, detail="Bulunamadı")
    return {"message": "Silindi"}

# --- CONTACT ---
@api_router.post("/contact")
async def send_contact_message(msg: ContactMessage):
    doc = msg.model_dump()
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    await messages_collection.insert_one(doc)
    return {"message": "İletildi"}

@api_router.get("/")
async def root(): return {"message": "API Çalışıyor"}

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["https://yenisitem.vercel.app", "http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown_db_client(): client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)