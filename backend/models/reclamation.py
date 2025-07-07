from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from typing import List, Optional

class Reclamation(BaseModel):
    id: Optional[str] = None
    user_id: str
    categorie_id: str
    description_probleme: Optional[str] = ""  # URL ou nom du fichier
    date_creation: datetime = Field(default_factory=datetime.utcnow)
    image_vehicule: Optional[List[str]] = []
    facturation: Optional[List[str]] = [ ]
    autre: Optional[str] = ""
    retour_client: Optional[str] = ""
    action: Optional[str] = ""
    statut: Optional[str] = Field(default="En attente", description="Statut de la réclamation (ex: ouverte, en cours, fermée)")