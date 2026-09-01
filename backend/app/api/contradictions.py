from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Contradiction, User
from app.schemas.dto import ContradictionDTO
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/research/{project_id}/contradictions", tags=["Contradictions"])

@router.get("", response_model=List[ContradictionDTO])
def list_contradictions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contradictions = db.query(Contradiction).filter(Contradiction.project_id == project_id).all()
    return [ContradictionDTO.model_validate(c) for c in contradictions]
