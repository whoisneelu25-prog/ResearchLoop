from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import ResearchDirection, User
from app.schemas.dto import (
    ResearchDirectionDTO,
    ScoreBreakdownDTO,
)
from app.api.auth import get_current_user
from app.scoring.opportunity import get_score_breakdown

router = APIRouter(prefix="/api/research/{project_id}/hypotheses", tags=["Potential Research Directions"])

@router.get("", response_model=List[ResearchDirectionDTO])
def list_hypotheses(
    project_id: str,
    saved_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ResearchDirection).filter(ResearchDirection.project_id == project_id)
    if saved_only:
        query = query.filter(ResearchDirection.is_saved == True)
    
    hypotheses = query.order_by(ResearchDirection.overall_score.desc()).all()
    return [ResearchDirectionDTO.model_validate(h) for h in hypotheses]


@router.post("/{hypothesis_id}/toggle-save", response_model=ResearchDirectionDTO)
def toggle_save_direction(
    project_id: str,
    hypothesis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hyp = db.query(ResearchDirection).filter(
        ResearchDirection.project_id == project_id,
        ResearchDirection.id == hypothesis_id
    ).first()
    if not hyp:
        raise HTTPException(status_code=404, detail="Research direction not found")

    hyp.is_saved = not hyp.is_saved
    db.commit()
    db.refresh(hyp)
    return ResearchDirectionDTO.model_validate(hyp)


@router.get("/{hypothesis_id}/score-breakdown", response_model=ScoreBreakdownDTO)
def get_direction_score_breakdown(
    project_id: str,
    hypothesis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hyp = db.query(ResearchDirection).filter(
        ResearchDirection.project_id == project_id,
        ResearchDirection.id == hypothesis_id
    ).first()
    if not hyp:
        raise HTTPException(status_code=404, detail="Research direction not found")

    breakdown = get_score_breakdown(
        hyp.novelty_score,
        hyp.gap_score,
        hyp.feasibility_score,
        hyp.impact_score
    )
    return ScoreBreakdownDTO(
        novelty_score=breakdown["novelty_score"],
        gap_score=breakdown["gap_score"],
        feasibility_score=breakdown["feasibility_score"],
        impact_score=breakdown["impact_score"],
        overall_score=breakdown["overall_score"],
        tier=breakdown["tier"],
        formula_display=breakdown["formula_display"]
    )
