from fastapi import APIRouter, HTTPException
from models.reclamation import Reclamation
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import MONGO_URI, MONGO_DB
from typing import List
from fastapi.responses import JSONResponse
from datetime import datetime

reclamation_router = APIRouter()
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

def convert_mongo_doc(doc: dict):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

# Correction de la route POST
@reclamation_router.post("/", response_model=dict)
async def create_reclamation(recom: Reclamation):
    # Vérification de l'utilisateur
    user = await db.users.find_one({"_id": ObjectId(recom.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Vérification de la catégorie
    categorie = await db.categories.find_one({"_id": ObjectId(recom.categorie_id)})
    if not categorie:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")

    # Insertion dans la collection 'reclamations' (pas 'recomdations')
    result = await db.reclamations.insert_one(recom.model_dump())  # model_dump() est correct pour pydantic v2

    return {"id": str(result.inserted_id), "message": "Réclamation créée avec succès"}

@reclamation_router.get("/", response_model=List[Reclamation])
async def get_all_reclamations():
    reclamations = await db.reclamations.find().to_list(100)
    reclamations = [convert_mongo_doc(rec) for rec in reclamations]
    return reclamations

@reclamation_router.get("/{reclamation_id}", response_model=Reclamation)
async def get_reclamation_by_id(reclamation_id: str):
    reclamation = await db.reclamations.find_one({"_id": ObjectId(reclamation_id)})
    if not reclamation:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")
    reclamation = convert_mongo_doc(reclamation)
    return Reclamation(**reclamation)

@reclamation_router.get("/user/{user_id}", response_model=List[Reclamation])
async def get_reclamations_by_user(user_id: str):
    recs = await db.reclamations.find({"user_id": user_id}).to_list(100)
    if not recs:
        raise HTTPException(status_code=404, detail="Aucune réclamation trouvée pour cet utilisateur")
    recs = [convert_mongo_doc(rec) for rec in recs]
    return recs

@reclamation_router.put("/{reclamation_id}")
async def update_reclamation(reclamation_id: str, updated_data: Reclamation):
    result = await db.reclamations.update_one(
        {"_id": ObjectId(reclamation_id)},
        {"$set": updated_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée ou aucune modification")
    return {"message": "Réclamation mise à jour avec succès"}

@reclamation_router.delete("/{reclamation_id}")
async def delete_reclamation(reclamation_id: str):
    result = await db.reclamations.delete_one({"_id": ObjectId(reclamation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")
    return {"message": "Réclamation supprimée avec succès"}
