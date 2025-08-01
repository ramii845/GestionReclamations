from fastapi import APIRouter, HTTPException
from models.avis import Avis
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import MONGO_URI, MONGO_DB
from typing import List
from fastapi import Query
from typing import Optional

avis_router = APIRouter()
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

def get_objectid(id: str):
    try:
        return ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Format d'ID invalide")

@avis_router.post("/", response_model=dict)
async def create_avis(avis: Avis):
    # Vérifie existence de l'utilisateur et de la réclamation
    user = await db.users.find_one({"_id": get_objectid(avis.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    reclamation = await db.reclamations.find_one({"_id": get_objectid(avis.reclamation_id)})
    if not reclamation:
        raise HTTPException(status_code=404, detail="Réclamation non trouvée")

    result = await db.avis.insert_one(avis.model_dump())
    return {"id": str(result.inserted_id), "message": "Avis enregistré avec succès"}

@avis_router.get("/", response_model=List[Avis])
async def get_all_avis():
    avis_list = await db.avis.find().to_list(100)
    for a in avis_list:
        a["id"] = str(a["_id"])
        del a["_id"]
    return avis_list


@avis_router.get("/paginated", response_model=dict)
async def get_avis_paginated(
    page: int = Query(1, ge=1),
    limit: int = Query(7, ge=1),
    nbetoiles: Optional[int] = Query(None, ge=1, le=5)
):
    skip = (page - 1) * limit
    query_filter = {}
    if nbetoiles is not None:
        query_filter["nbetoiles"] = nbetoiles

    total = await db.avis.count_documents(query_filter)

    avis = await (
        db.avis
        .find(query_filter)
        .sort("_id", -1)  # Tri du plus récent au plus ancien
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    for avis_doc in avis:
        avis_doc["id"] = str(avis_doc["_id"])
        del avis_doc["_id"]

    return {
        "status_code": 200,
        "page": page,
        "total_pages": (total + limit - 1) // limit,
        "total_avis": total,
        "avis": avis,
    }



@avis_router.get("/reclamation/{reclamation_id}", response_model=List[Avis])
async def get_avis_by_reclamation(reclamation_id: str):
    avis_list = await db.avis.find({"reclamation_id": reclamation_id}).to_list(100)
    if not avis_list:
        raise HTTPException(status_code=404, detail="Aucun avis pour cette réclamation")
    for a in avis_list:
        a["id"] = str(a["_id"])
        del a["_id"]
    return avis_list

@avis_router.delete("/{avis_id}", response_model=dict)
async def delete_avis(avis_id: str):
    result = await db.avis.delete_one({"_id": get_objectid(avis_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Avis non trouvé")
    return {"message": "Avis supprimé avec succès"}
