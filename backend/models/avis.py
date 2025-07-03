from pydantic import BaseModel

class Avis(BaseModel):
    user_id: str
    reclamation_id: str
    nbetoiles: int
    commentaire: str
