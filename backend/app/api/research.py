from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import (
    User,
    ResearchProject,
    Paper,
    StudyEvidence,
    Contradiction,
    ResearchGap,
    ResearchDirection,
)
from app.schemas.dto import (
    ProjectCreateRequest,
    ProjectSummaryResponse,
    ProjectDetailResponse,
)
from app.api.auth import get_current_user
from app.services.research_service import research_service
from app.services.topic_matcher import topic_matcher
from app.seed.topic_dataset_generator import TOPIC_METADATA
from app.seed.seeder import seed_database

router = APIRouter(prefix="/api/research", tags=["Research Projects"])

class TopicMatchRequest(BaseModel):
    query: str

@router.get("/topics", response_model=List[Dict[str, Any]])
def list_predefined_topics(
    db: Session = Depends(get_db)
):
    """Return all 15 predefined research topics with real database entity counts."""
    results = []
    for topic in TOPIC_METADATA:
        t_id = topic["id"]
        proj = db.query(ResearchProject).filter(ResearchProject.id == t_id).first()
        
        paper_cnt = db.query(Paper).filter(Paper.project_id == t_id).count() if proj else 0
        contra_cnt = db.query(Contradiction).filter(Contradiction.project_id == t_id).count() if proj else 0
        gap_cnt = db.query(ResearchGap).filter(ResearchGap.project_id == t_id).count() if proj else 0
        dir_cnt = db.query(ResearchDirection).filter(ResearchDirection.project_id == t_id).count() if proj else 0

        results.append({
            "id": t_id,
            "title": topic["title"],
            "disease": topic.get("disease"),
            "intervention": topic.get("intervention"),
            "biomarker": topic.get("biomarker"),
            "population": topic.get("population"),
            "summary": topic.get("summary"),
            "paper_count": paper_cnt,
            "contradiction_count": contra_cnt,
            "gap_count": gap_cnt,
            "direction_count": dir_cnt,
        })
    return results

@router.post("/match-topic", response_model=Dict[str, Any])
def match_topic_query(
    req: TopicMatchRequest,
    db: Session = Depends(get_db)
):
    """Match search query against all 15 predefined topics with confidence rating."""
    match_res = topic_matcher.match(req.query)
    
    # If matched, attach real entity counts
    if match_res["matched_topic"]:
        t_id = match_res["matched_topic"]["id"]
        paper_cnt = db.query(Paper).filter(Paper.project_id == t_id).count()
        contra_cnt = db.query(Contradiction).filter(Contradiction.project_id == t_id).count()
        gap_cnt = db.query(ResearchGap).filter(ResearchGap.project_id == t_id).count()
        dir_cnt = db.query(ResearchDirection).filter(ResearchDirection.project_id == t_id).count()
        
        match_res["matched_topic"]["paper_count"] = paper_cnt
        match_res["matched_topic"]["contradiction_count"] = contra_cnt
        match_res["matched_topic"]["gap_count"] = gap_cnt
        match_res["matched_topic"]["direction_count"] = dir_cnt

    return match_res

@router.get("", response_model=List[ProjectSummaryResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If demo user, ensure demo data is seeded
    if current_user.is_demo:
        seed_database(db)

    # Exclude internal topic memory projects (topic-%) from My Research list
    projects = (
        db.query(ResearchProject)
        .filter(
            ((ResearchProject.user_id == current_user.id) | (ResearchProject.id == "demo-lung-cancer-project-001")) &
            (~ResearchProject.id.like("topic-%"))
        )
        .order_by(ResearchProject.updated_at.desc())
        .all()
    )
    return [ProjectSummaryResponse.model_validate(p) for p in projects]


@router.post("", response_model=ProjectSummaryResponse)
def create_project(
    req: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = req.title or f"Research Analysis: {req.query[:40]}"
    project = ResearchProject(
        user_id=current_user.id,
        title=title,
        query=req.query,
        disease=req.disease,
        intervention=req.intervention,
        biomarker=req.biomarker,
        population=req.population,
        study_type=req.study_type,
        status="CREATED",
        status_message="Project created. Ready to initialize literature analysis pipeline.",
        is_demo=bool(req.use_demo_data)
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectSummaryResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found")

    # Counts and evidence distribution
    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    evidence = db.query(StudyEvidence).filter(StudyEvidence.project_id == project_id).all()
    contradictions = db.query(Contradiction).filter(Contradiction.project_id == project_id).all()
    gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).all()
    hypotheses = db.query(ResearchDirection).filter(ResearchDirection.project_id == project_id).all()

    distribution = {
        "positive": len([e for e in evidence if e.result_type == "positive"]),
        "negative": len([e for e in evidence if e.result_type == "negative"]),
        "null": len([e for e in evidence if e.result_type == "null"]),
        "mixed": len([e for e in evidence if e.result_type == "mixed"]),
        "inconclusive": len([e for e in evidence if e.result_type == "inconclusive"]),
    }

    negative_count = len([e for e in evidence if e.is_negative_finding or e.result_type in ["negative", "null"]])

    return ProjectDetailResponse(
        id=project.id,
        title=project.title,
        query=project.query,
        disease=project.disease,
        intervention=project.intervention,
        biomarker=project.biomarker,
        population=project.population,
        study_type=project.study_type,
        status=project.status,
        status_message=project.status_message,
        summary=project.summary,
        paper_count=len(papers),
        negative_count=negative_count,
        contradiction_count=len(contradictions),
        gap_count=len(gaps),
        direction_count=len(hypotheses),
        evidence_distribution=distribution,
        is_demo=project.is_demo,
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@router.post("/{project_id}/analyze", response_model=ProjectDetailResponse)
def run_project_analysis(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found")

    updated_project = research_service.execute_analysis_pipeline(db, project_id)
    return get_project_detail(project_id, current_user, db)


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found")
    
    if project.is_demo:
        raise HTTPException(status_code=400, detail="Demo project cannot be deleted")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}
