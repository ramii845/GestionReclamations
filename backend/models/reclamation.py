from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from typing import List, Optional

class Reclamation(BaseModel):
    user_id: str
    categorie_id: str
    description_probleme: str= ""  
    date_creation: datetime = Field(default_factory=datetime.utcnow)
    image_vehicule: Optional[List[str]] = []
    facturation: Optional[List[str]] = [ ]
    autre: Optional[str] = ""
    retour_client: str = ""
    action: str= ""
    retour_admin: str= ""
    statut: str= Field(default="En attente", description="Statut de la réclamation")