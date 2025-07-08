from fastapi import APIRouter, HTTPException
from models.notification import Notification
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, MONGO_DB
from bson import ObjectId
from typing import List

notification_router = APIRouter()
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

@notification_router.post("/", response_model=dict)
async def create_notification(notification: Notification):
    result = await db.notifications.insert_one(notification.dict())
    return {"id": str(result.inserted_id), "message": "Notification enregistrée"}

@notification_router.get("/", response_model=List[Notification])
async def get_all_notifications():
    notifications = await db.notifications.find().sort("created_at", -1).to_list(100)
    for notif in notifications:
        notif["id"] = str(notif["_id"])
        del notif["_id"]
    return notifications

@notification_router.put("/{notif_id}/read")
async def mark_as_read(notif_id: str):
    result = await db.notifications.update_one(
        {"_id": ObjectId(notif_id)},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return {"message": "Notification marquée comme lue"}
