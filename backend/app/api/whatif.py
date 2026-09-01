from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User
from app.schemas.dto import WhatIfRequest, WhatIfResponse, StudyEvidenceDTO
from app.api.auth import get_current_user
from app.services.research_service import research_service

router = APIRouter(prefix="/api/research/{project_id}/what-if", tags=["What-If Simulation"])

@router.post("", response_model=WhatIfResponse)
def simulate_what_if_scenario(
    project_id: str,
    req: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = research_service.simulate_what_if(db, project_id, req.model_dump())
    return WhatIfResponse(
        coverage_status=result["coverage_status"],
        coverage_percentage=result["coverage_percentage"],
        total_matching_studies=result["total_matching_studies"],
        high_confidence_studies=result["high_confidence_studies"],
        contradiction_count=result["contradiction_count"],
        potential_gap_detected=result["potential_gap_detected"],
        gap_description=result["gap_description"],
        recommended_direction=result["recommended_direction"],
        matching_evidence=[StudyEvidenceDTO.model_validate(e) for e in result["matching_evidence"]]
    )
