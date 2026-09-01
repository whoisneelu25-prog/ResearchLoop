from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, ResearchProject, CopilotConversation, CopilotMessage
from app.schemas.dto import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotConversationDTO,
    CopilotMessageDTO,
)
from app.api.auth import get_current_user
from app.ai.copilot_service import copilot_service

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

def _verify_project_access(project_id: str, current_user: User, db: Session) -> ResearchProject:
    """Ensure authenticated researcher has secure access to the specified project."""
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research project not found"
        )
    # Demo projects are accessible by all authenticated users, otherwise match user_id
    if not project.is_demo and project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this research project"
        )
    return project

@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat(
    req: CopilotChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Process user query against project research intelligence with source grounding."""
    # 1. Verify project ownership/access
    project = _verify_project_access(req.project_id, current_user, db)

    # 2. Check input constraints
    if not req.message or len(req.message.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )
    if len(req.message) > 8000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please shorten your question (maximum 8000 characters allowed)"
        )

    # 3. Execute Copilot RAG pipeline
    try:
        result = copilot_service.process_chat(
            db=db,
            user_id=current_user.id,
            project_id=project.id,
            message=req.message.strip(),
            conversation_id=req.conversation_id,
            context_type=req.context_type,
            context_id=req.context_id,
            page_context=req.page_context,
        )
        return CopilotChatResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot intelligence processing error: {str(e)}"
        )

@router.get("/conversations/{project_id}", response_model=List[CopilotConversationDTO])
def list_conversations(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List previous conversation threads for the current project."""
    _verify_project_access(project_id, current_user, db)
    convs = (
        db.query(CopilotConversation)
        .filter(
            CopilotConversation.project_id == project_id,
            CopilotConversation.user_id == current_user.id,
        )
        .order_by(CopilotConversation.updated_at.desc())
        .all()
    )
    return convs

@router.get("/conversations/{project_id}/{conversation_id}", response_model=CopilotConversationDTO)
def get_conversation(
    project_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve message history for a specific conversation thread."""
    _verify_project_access(project_id, current_user, db)
    conv = (
        db.query(CopilotConversation)
        .filter(
            CopilotConversation.id == conversation_id,
            CopilotConversation.project_id == project_id,
            CopilotConversation.user_id == current_user.id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conv

@router.delete("/conversations/{project_id}/{conversation_id}")
def delete_conversation(
    project_id: str,
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation thread."""
    _verify_project_access(project_id, current_user, db)
    conv = (
        db.query(CopilotConversation)
        .filter(
            CopilotConversation.id == conversation_id,
            CopilotConversation.project_id == project_id,
            CopilotConversation.user_id == current_user.id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    db.delete(conv)
    db.commit()
    return {"status": "success", "message": "Conversation deleted"}

@router.delete("/conversations/{project_id}")
def clear_all_conversations(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all conversations for current project and researcher."""
    _verify_project_access(project_id, current_user, db)
    convs = (
        db.query(CopilotConversation)
        .filter(
            CopilotConversation.project_id == project_id,
            CopilotConversation.user_id == current_user.id,
        )
        .all()
    )
    for c in convs:
        db.delete(c)
    db.commit()
    return {"status": "success", "message": "All conversations cleared for this project"}
