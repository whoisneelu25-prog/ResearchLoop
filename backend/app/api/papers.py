from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Paper, User
from app.schemas.dto import PaperDTO
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/research/{project_id}/papers", tags=["Papers"])

@router.get("", response_model=List[PaperDTO])
def list_papers(
    project_id: str,
    search: Optional[str] = Query(None),
    study_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Paper).filter(Paper.project_id == project_id)
    if search:
        query = query.filter(
            (Paper.title.ilike(f"%{search}%")) |
            (Paper.abstract.ilike(f"%{search}%")) |
            (Paper.authors.ilike(f"%{search}%")) |
            (Paper.external_id.ilike(f"%{search}%"))
        )
    if study_type and study_type != "All":
        query = query.filter(Paper.study_type.ilike(f"%{study_type}%"))

    papers = query.order_by(Paper.publication_year.desc()).all()
    return [PaperDTO.model_validate(p) for p in papers]


@router.get("/{paper_id}", response_model=PaperDTO)
def get_paper(
    project_id: str,
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.project_id == project_id, Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return PaperDTO.model_validate(paper)
