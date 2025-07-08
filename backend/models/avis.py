from pydantic import BaseModel
from typing import Optional
class Avis(BaseModel):
    user_id: str
    reclamation_id: str
    nbetoiles: int
    commentaire: Optional[str] = ""
