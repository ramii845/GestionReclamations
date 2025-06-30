from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from controllers.user_controller import user_router
from controllers.categorie_controller import cat_router
import numpy as np
import cv2

app = FastAPI()

# 🔵 CORS pour autoriser React Vite (localhost:5173)
origins = [
    "http://localhost:5173",  # URL de ton app React Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔵 Inclusion uniquement du router utilisateur
app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(cat_router, prefix="/categories", tags=["categories"]) 



# 🔵 Route d'accueil
@app.get("/")
async def root():
    return {"message": "Backend FastAPI connecté à MongoDB avec succès 🚀"}
