from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import ResearchGap, User
from app.schemas.dto import ResearchGapDTO
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/research/{project_id}/gaps", tags=["Research Gaps"])

@router.get("", response_model=List[ResearchGapDTO])
def list_gaps(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).all()
    return [ResearchGapDTO.model_validate(g) for g in gaps]
