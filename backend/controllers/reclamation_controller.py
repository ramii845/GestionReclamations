from fastapi import APIRouter, HTTPException
from models.reclamation import Reclamation
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import MONGO_URI, MONGO_DB
from typing import List
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi import Query
from typing import Optional
from pydantic import BaseModel
from models.notification import Notification  # si ce n’est pas déjà importé


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

    # Création de la réclamation
    result = await db.reclamations.insert_one(recom.model_dump())

    # Création de la notification
    notification = Notification(
        user_id=recom.user_id,  # à remplacer par un vrai ID d'admin
        message=f"Nouvelle réclamation déposée par l'utilisateur {user['nom']}",
        type="reclamation",
        is_read=False
    )
    await db.notifications.insert_one(notification.dict())

    return {"id": str(result.inserted_id), "message": "Réclamation créée avec succès"}

@reclamation_router.get("/", response_model=List[Reclamation])
async def get_all_reclamations():
    reclamations = await db.reclamations.find().to_list(100)
    reclamations = [convert_mongo_doc(rec) for rec in reclamations]
    return reclamations


@reclamation_router.get("/paginated", response_model=dict)
async def get_reclamations_paginated(page: int = Query(1, ge=1), limit: int = Query(7, ge=1)):
    skip = (page - 1) * limit
    total = await db.reclamations.count_documents({})
    reclamations = await db.reclamations.find().skip(skip).limit(limit).to_list(length=limit)

    for rec in reclamations:
        rec["id"] = str(rec["_id"])
        del rec["_id"]
        for key, value in rec.items():
            if isinstance(value, datetime):
                rec[key] = value.isoformat()

    return {
        "status_code": 200,
        "page": page,
        "total_pages": (total + limit - 1) // limit,
        "total_reclamations": total,
        "reclamations": reclamations
    }


@reclamation_router.get("/{reclamation_id}", response_model=Reclamation)
async def get_reclamation_by_id(reclamation_id: str):
    reclamation = await db.reclamations.find_one({"_id": ObjectId(reclamation_id)})
    if not reclamation:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")
    reclamation = convert_mongo_doc(reclamation)
    return Reclamation(**reclamation)

@reclamation_router.get("/user/{user_id}", response_model=dict)
async def get_reclamations_by_user(user_id: str):
    # Recherche de la réclamation la plus récente de l'utilisateur
    reclamation = await db.reclamations.find_one(
        {"user_id": user_id},
        sort=[("date_creation", -1)]  # -1 = tri décroissant = dernière d'abord
    )

    if not reclamation:
        raise HTTPException(status_code=404, detail="utilisateur non trouvé")

    # Ajout de l'ID
    reclamation["id"] = str(reclamation["_id"])
    del reclamation["_id"]

    # Conversion datetime
    for key, value in reclamation.items():
        if isinstance(value, datetime):
            reclamation[key] = value.isoformat()

    return reclamation





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
    # Trouver la réclamation à supprimer
    reclamation = await db.reclamations.find_one({"_id": ObjectId(reclamation_id)})
    if not reclamation:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")
    
    # Copier la réclamation dans la collection archive sans date d'archivage
    await db.reclamations_archive.insert_one(reclamation)
    
    # Supprimer la réclamation originale
    result = await db.reclamations.delete_one({"_id": ObjectId(reclamation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Erreur lors de la suppression")

    return {"message": "Réclamation archivée et supprimée avec succès"}

class ReclamationUpdateImages(BaseModel):
    image_vehicule: Optional[List[str]] = []
    facturation: Optional[List[str]] = []

@reclamation_router.put("/add-images/{reclamation_id}")
async def add_images_to_reclamation(reclamation_id: str, updated_data: ReclamationUpdateImages):
    existing_rec = await db.reclamations.find_one({"_id": ObjectId(reclamation_id)})
    if not existing_rec:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")

    old_images = existing_rec.get("image_vehicule", [])
    old_facturation = existing_rec.get("facturation", [])

    new_images = updated_data.image_vehicule or []
    new_facturation = updated_data.facturation or []

    updated_images = old_images + [img for img in new_images if img not in old_images]
    updated_facturation = old_facturation + [f for f in new_facturation if f not in old_facturation]

    update_dict = {
        "image_vehicule": updated_images,
        "facturation": updated_facturation
    }

    result = await db.reclamations.update_one(
        {"_id": ObjectId(reclamation_id)},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")

    return {"message": "Réclamation mise à jour avec succès"}