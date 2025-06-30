from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import os
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
    """Convertit un document MongoDB en dict avec id au lieu de _id, convertit dates en str."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]

    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

UPLOAD_IMAGE_DIR = "public/images"
UPLOAD_PDF_DIR = "public/pdfs"
os.makedirs(UPLOAD_IMAGE_DIR, exist_ok=True)
os.makedirs(UPLOAD_PDF_DIR, exist_ok=True)

@reclamation_router.post("/")
async def create_reclamation(
    user_id: str = Form(...),
    categorie_id: str = Form(...),
    description_probleme: str = Form(""),
    autre: str = Form(""),
    image_vehicule: UploadFile = File(None),
    facturation: UploadFile = File(None)
):
    # Vérification des IDs
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur non trouvé")

    categorie = await db.categories.find_one({"_id": ObjectId(categorie_id)})
    if not categorie:
        raise HTTPException(status_code=400, detail="Catégorie non trouvée")

    image_filename = ""
    if image_vehicule:
        image_filename = f"{ObjectId()}.{image_vehicule.filename.split('.')[-1]}"
        image_path = os.path.join(UPLOAD_IMAGE_DIR, image_filename)
        with open(image_path, "wb") as f:
            f.write(await image_vehicule.read())

    pdf_filename = ""
    if facturation:
        pdf_filename = f"{ObjectId()}.pdf"
        pdf_path = os.path.join(UPLOAD_PDF_DIR, pdf_filename)
        with open(pdf_path, "wb") as f:
            f.write(await facturation.read())

    reclamation_data = {
        "user_id": user_id,
        "categorie_id": categorie_id,
        "description_probleme": description_probleme,
        "autre": autre,
        "image_vehicule": image_filename,
        "facturation": pdf_filename,
        "date_creation": datetime.utcnow(),
        "retour_client": "",
        "action": "",
        "statut": ""
    }

    result = await db.reclamations.insert_one(reclamation_data)
    return {"id": str(result.inserted_id), "message": "Réclamation enregistrée ✅"}

@reclamation_router.get("/", response_model=List[Reclamation])
async def get_all_reclamations():
    reclamations = await db.reclamations.find().to_list(100)
    reclamations = [convert_mongo_doc(rec) for rec in reclamations]
    return JSONResponse(status_code=200, content={"reclamations": reclamations})

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
    return JSONResponse(status_code=200, content={"reclamations": recs})

@reclamation_router.put("/{reclamation_id}")
async def update_reclamation(reclamation_id: str, updated_data: Reclamation):
    result = await db.reclamations.update_one(
        {"_id": ObjectId(reclamation_id)},
        {"$set": updated_data.dict()}
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
