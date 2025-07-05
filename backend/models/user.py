from pydantic import BaseModel
from typing import Optional
class User(BaseModel):
    nom: str
    matricule_vehicule: str
    marque: str
    modele: str
    numero_telephone: str
    motdepasse: str
    photo: Optional[str] =""
    role: str = "user"
