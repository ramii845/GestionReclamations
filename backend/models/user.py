from pydantic import BaseModel

class User(BaseModel):
    nom: str
    matricule_vehicule: str
    marque: str
    modele: str
    numero_telephone: str
    motdepasse: str
    role: str = "user"
