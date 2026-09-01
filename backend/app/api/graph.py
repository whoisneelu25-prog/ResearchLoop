from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User
from app.schemas.dto import KnowledgeGraphDTO, GraphNodeDTO, GraphEdgeDTO
from app.api.auth import get_current_user
from app.graph.graph_service import graph_service

router = APIRouter(prefix="/api/research/{project_id}/graph", tags=["Knowledge Graph"])

@router.get("", response_model=KnowledgeGraphDTO)
def get_knowledge_graph(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    graph_data = graph_service.get_project_graph(db, project_id)
    return KnowledgeGraphDTO(
        nodes=[GraphNodeDTO(**n) for n in graph_data["nodes"]],
        edges=[GraphEdgeDTO(**e) for e in graph_data["edges"]]
    )
