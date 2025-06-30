from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Reclamation(BaseModel):
    user_id: str
    categorie_id: str
    description_probleme: Optional[str] = ""
    image_vehicule: Optional[str] = ""  # URL ou nom du fichier
    date_creation: datetime = Field(default_factory=datetime.utcnow)
    facturation: Optional[str] = None  # PDF (ex: base64 ou nom fichier)
    autre: Optional[str] = ""
    retour_client: Optional[str] = ""
    action: Optional[str] = ""
    statut: Optional[str] = Field(default="", description="Statut de la réclamation (ex: ouverte, en cours, fermée)")
