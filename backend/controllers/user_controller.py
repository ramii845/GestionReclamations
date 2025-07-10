from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from models.user import User
from pydantic import BaseModel
from config import SECRET_KEY, MONGO_URI, MONGO_DB, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
import datetime
from fastapi.responses import JSONResponse
from bson import ObjectId
from typing import List, Optional
import httpx
from fastapi import Query
import re


user_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

def get_objectid(id: str):
    try:
        return ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

class UserLogin(BaseModel):
    matricule_vehicule: str
    motdepasse: str

class ResetPasswordRequest(BaseModel):
    matricule_vehicule: str
    nouveau_motdepasse: str

async def upload_to_cloudinary(file: UploadFile) -> str:
    """Upload file to Cloudinary and return secure_url."""
    url = 'https://api.cloudinary.com/v1_1/ditzf19gl/image/upload'
    data = {
        "upload_preset": CLOUDINARY_UPLOAD_PRESET  # par exemple "ProjetRL"
    }
    files = {"file": (file.filename, await file.read(), file.content_type)}

    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, files=files)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erreur upload Cloudinary")
        result = response.json()
        return result.get("secure_url", "")

@user_router.post("/register/")
async def register(user: User):
    existing_user = await db.users.find_one({"matricule_vehicule": user.matricule_vehicule})
    if existing_user:
        raise HTTPException(status_code=400, detail="matricule_vehicule déjà utilisé")

    hashed_password = pwd_context.hash(user.motdepasse)
    user_data = user.dict()
    user_data["motdepasse"] = hashed_password

    result = await db.users.insert_one(user_data)
    return {"id": str(result.inserted_id), "message": "Utilisateur créé avec succès"}

@user_router.post("/login/")
async def signin(user_data: UserLogin):
    # Recherche insensible à la casse du matricule_vehicule
    existing_user = await db.users.find_one({
        "matricule_vehicule": {
            "$regex": f"^{re.escape(user_data.matricule_vehicule)}$", 
            "$options": "i"
        }
    })
    
    if not existing_user or not pwd_context.verify(user_data.motdepasse, existing_user["motdepasse"]):
        raise HTTPException(status_code=400, detail="matricule_vehicule ou mot de passe incorrect")

    token = jwt.encode(
        {
            "user_id": str(existing_user["_id"]),
            "role": existing_user.get("role", "user"),
            "nom": existing_user["nom"],
            "matricule_vehicule": existing_user["matricule_vehicule"],
            "marque": existing_user["marque"],
            "modele": existing_user["modele"],
            "numero_telephone": existing_user["numero_telephone"],
            "photo": existing_user["photo"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=4)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return {"token": token, "role": existing_user.get("role", "user"), "message": "Connexion réussie"}

@user_router.get("/", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(100)
    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]
    return JSONResponse(status_code=200, content={"status_code": 200, "users": users})

@user_router.put("/{user_id}", response_model=dict)
async def update_user(user_id: str, user: User):
    result = await db.users.update_one({"_id": get_objectid(user_id)}, {"$set": user.dict()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}

@user_router.delete("/{user_id}", response_model=dict)
async def delete_user(user_id: str):
    result = await db.users.delete_one({"_id": get_objectid(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# 🔵 1. Route pagination en premier
@user_router.get("/paginated", response_model=dict)
async def get_users_paginated(page: int = Query(1, ge=1), limit: int = Query(7, ge=1)):
    skip = (page - 1) * limit
    total = await db.users.count_documents({})
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)

    for user in users:
        user["id"] = str(user["_id"])
        del user["_id"]

    return {
        "status_code": 200,
        "page": page,
        "total_pages": (total + limit - 1) // limit,
        "total_users": total,
        "users": users
    }

# 🔵 2. Route reset password
@user_router.post("/reset-password/")
async def reset_password(data: ResetPasswordRequest):
    user = await db.users.find_one({"matricule_vehicule": data.matricule_vehicule})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    hashed_password = pwd_context.hash(data.nouveau_motdepasse)

    await db.users.update_one(
        {"matricule_vehicule": data.matricule_vehicule},
        {"$set": {"motdepasse": hashed_password}}
    )

    return {"message": "Mot de passe mis à jour avec succès"}

# 🔵 3. Route GET par ID (à la fin)
@user_router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: str):
    user = await db.users.find_one({"_id": get_objectid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user["id"] = str(user["_id"])
    del user["_id"]
    return user
