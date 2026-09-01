from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import StudyEvidence, Paper, User
from app.schemas.dto import StudyEvidenceDTO
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/research/{project_id}", tags=["Evidence"])

@router.get("/evidence", response_model=List[StudyEvidenceDTO])
def list_evidence(
    project_id: str,
    result_type: Optional[str] = Query(None),
    biomarker: Optional[str] = Query(None),
    confidence: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(StudyEvidence).filter(StudyEvidence.project_id == project_id)

    if result_type and result_type != "All":
        query = query.filter(StudyEvidence.result_type == result_type.lower())
    if biomarker and biomarker != "All":
        query = query.filter(StudyEvidence.biomarker.ilike(f"%{biomarker}%"))
    if confidence and confidence != "All":
        query = query.filter(StudyEvidence.confidence == confidence)
    if search:
        query = query.filter(
            (StudyEvidence.study_label.ilike(f"%{search}%")) |
            (StudyEvidence.intervention.ilike(f"%{search}%")) |
            (StudyEvidence.result_summary.ilike(f"%{search}%")) |
            (StudyEvidence.evidence_text.ilike(f"%{search}%"))
        )

    evidence_items = query.order_by(StudyEvidence.year.desc()).all()
    return [StudyEvidenceDTO.model_validate(e) for e in evidence_items]


@router.get("/failures", response_model=List[StudyEvidenceDTO])
def list_negative_findings(
    project_id: str,
    classification: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(StudyEvidence).filter(
        StudyEvidence.project_id == project_id,
        (StudyEvidence.is_negative_finding == True) | (StudyEvidence.result_type.in_(["negative", "null", "mixed"]))
    )

    if classification and classification != "All":
        query = query.filter(StudyEvidence.negative_classification.ilike(f"%{classification}%"))

    findings = query.order_by(StudyEvidence.year.desc()).all()
    return [StudyEvidenceDTO.model_validate(f) for f in findings]
