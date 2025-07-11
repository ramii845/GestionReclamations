from fastapi import APIRouter, HTTPException
from models.reclamationArchive import ReclamationArchive
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from config import MONGO_URI, MONGO_DB
from typing import List
from fastapi.responses import JSONResponse
from datetime import datetime
from fastapi import Query
from typing import Optional
from pydantic import BaseModel

archive_router = APIRouter()
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]



def convert_mongo_doc(doc: dict):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

@archive_router.post("/", response_model=dict)
async def create_archive(archive: ReclamationArchive):
    result = await db.reclamations_archive.insert_one(archive.model_dump())
    return {"id": str(result.inserted_id), "message": "Archive ajoutée avec succès"}

@archive_router.get("/", response_model=List[ReclamationArchive])
async def get_all_archives():
    archives = await db.reclamations_archive.find().to_list(100)
    archives = [convert_mongo_doc(a) for a in archives]
    return archives
@archive_router.get("/paginated", response_model=dict)
async def get_reclamations_paginated(
    page: int = Query(1, ge=1),
    limit: int = Query(7, ge=1),
    date_creation: Optional[str] = Query(None, description="Filtrer par date au format YYYY-MM-DD"),
    categorie_id: Optional[str] = Query(None),
    description_probleme: Optional[str] = Query(None),
    statut: Optional[str] = Query(None),
):
    skip = (page - 1) * limit

    # Construire le filtre MongoDB dynamiquement
    query_filter = {}

    if date_creation:
        date_start = datetime.fromisoformat(date_creation)
        date_end = date_start.replace(hour=23, minute=59, second=59)
        query_filter["date_creation"] = {"$gte": date_start, "$lte": date_end}

    if categorie_id:
        query_filter["categorie_id"] = categorie_id

    if description_probleme:
        query_filter["description_probleme"] = description_probleme

    if statut:
        query_filter["statut"] = statut

    total = await db.reclamations_archive.count_documents(query_filter)
    reclamations = await (
        db.reclamations_archive
        .find(query_filter)
        .sort("date_creation", -1)  # tri décroissant : du plus récent au plus ancien
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

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



@archive_router.get("/{archive_id}", response_model=ReclamationArchive)
async def get_archive_by_id(archive_id: str):
    archive = await db.reclamations_archive.find_one({"_id": ObjectId(archive_id)})
    if not archive:
        raise HTTPException(status_code=404, detail="Archive non trouvée")
    archive = convert_mongo_doc(archive)
    return ReclamationArchive(**archive)

@archive_router.delete("/{archive_id}")
async def delete_archive(archive_id: str):
    result = await db.reclamations_archive.delete_one({"_id": ObjectId(archive_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Archive non trouvée")
    return {"message": "Archive supprimée avec succès"}

