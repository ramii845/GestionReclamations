from fastapi import APIRouter, HTTPException
from models.categorie import Categorie
from config import MONGO_URI, MONGO_DB
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import JSONResponse
from typing import List
from bson import ObjectId

cat_router = APIRouter()
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

@cat_router.post("/", response_model=dict)
async def create_categorie(categorie: Categorie):
    result = await db.categories.insert_one(categorie.dict())
    return {"id": str(result.inserted_id)}

@cat_router.get("/", response_model=List[Categorie])
async def get_payes():
    cats = await db.categories.find().to_list(100)

    # Convertir _id en string et l'ajouter en tant que 'id'
    for cat in cats:
        cat["id"] = str(cat["_id"])
        del cat["_id"]  # Supprimer _id original si nécessaire

    return JSONResponse(status_code=200, content={"status_code": 200, "categories": cats})

@cat_router.get("/{categorie_id}", response_model=Categorie)
async def get_categorie(categorie_id: str):
    categorie = await db.categories.find_one({"_id": ObjectId(categorie_id)})
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return Categorie(**{**categorie, "id": str(categorie["_id"])})

@cat_router.put("/{categorie_id}", response_model=dict)
async def update_categorie(categorie_id: str, data: Categorie):
    result = await db.categories.update_one(
        {"_id": ObjectId(categorie_id)},
        {"$set": data.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return {"message": "Catégorie mise à jour avec succès"}

@cat_router.delete("/{categorie_id}", response_model=dict)
async def delete_categorie(categorie_id: str):
    result = await db.categories.delete_one({"_id": ObjectId(categorie_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    return {"message": "Catégorie supprimée avec succès"}
