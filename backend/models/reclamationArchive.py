from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReclamationArchive(BaseModel):
    user_id: str
    categorie_id: str
    description_probleme: Optional[str] = ""
    date_creation: datetime
    image_vehicule: Optional[List[str]] = []
    facturation: Optional[List[str]] = []
    autre: Optional[str] = ""
    retour_client: Optional[str] = ""
    action: Optional[str] = ""
    statut: Optional[str] = ""
