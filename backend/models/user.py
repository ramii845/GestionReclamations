from pydantic import BaseModel
from typing import Optional
class User(BaseModel):
    nom: str
    matricule_vehicule: str
    marque: str
    modele: str
    numero_telephone: str
    motdepasse: str
    photo: Optional[str] ="https://res.cloudinary.com/ditzf19gl/image/upload/v1751488048/n2lddktom038grirpldn.jpg"
    role: str = "user"
