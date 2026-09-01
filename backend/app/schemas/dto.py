from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

# ----------------- Auth Schemas -----------------

class UserRegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    institution: Optional[str] = None
    research_field: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    research_field: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    institution: Optional[str] = None
    research_field: Optional[str] = None
    is_demo: bool
    created_at: datetime


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Research Project Schemas -----------------

class ProjectCreateRequest(BaseModel):
    query: str
    title: Optional[str] = None
    disease: Optional[str] = None
    intervention: Optional[str] = None
    biomarker: Optional[str] = None
    population: Optional[str] = None
    study_type: Optional[str] = None
    use_demo_data: Optional[bool] = False

class ProjectSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    query: str
    disease: Optional[str] = None
    intervention: Optional[str] = None
    biomarker: Optional[str] = None
    status: str
    status_message: Optional[str] = None
    paper_count: int
    is_demo: bool
    created_at: datetime
    updated_at: datetime


class ProjectDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    query: str
    disease: Optional[str] = None
    intervention: Optional[str] = None
    biomarker: Optional[str] = None
    population: Optional[str] = None
    study_type: Optional[str] = None
    status: str
    status_message: Optional[str] = None
    summary: Optional[str] = None
    paper_count: int
    negative_count: int = 0
    contradiction_count: int = 0
    gap_count: int = 0
    direction_count: int = 0
    evidence_distribution: Dict[str, int] = {}
    is_demo: bool
    created_at: datetime
    updated_at: datetime


# ----------------- Evidence & Paper Schemas -----------------

class PaperDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    source: str
    external_id: Optional[str] = None
    doi: Optional[str] = None
    title: str
    abstract: Optional[str] = None
    authors: Optional[str] = None
    journal: Optional[str] = None
    publication_year: Optional[int] = None
    url: Optional[str] = None
    study_type: Optional[str] = None
    citation_count: int = 0
    created_at: datetime


class StudyEvidenceDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    paper_id: str
    project_id: str
    study_label: str
    year: Optional[int] = None
    disease: Optional[str] = None
    intervention: Optional[str] = None
    comparator: Optional[str] = None
    population: Optional[str] = None
    biomarker: Optional[str] = None
    study_type: Optional[str] = None
    sample_size: Optional[int] = None
    sample_size_display: Optional[str] = None
    primary_outcome: Optional[str] = None
    result_type: str
    result_category: Optional[str] = None
    result_summary: str
    effect_description: Optional[str] = None
    evidence_text: str
    confidence: str
    confidence_rationale: Optional[str] = None
    is_negative_finding: bool
    negative_classification: Optional[str] = None
    paper: Optional[PaperDTO] = None
    created_at: datetime


# ----------------- Contradictions & Gaps -----------------

class ContradictionDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    topic: str
    summary: str
    population_diff: Optional[str] = None
    biomarker_diff: Optional[str] = None
    dosage_diff: Optional[str] = None
    endpoint_diff: Optional[str] = None
    study_design_diff: Optional[str] = None
    sample_size_diff: Optional[str] = None
    possible_explanation: str
    confidence: str
    evidence_a: StudyEvidenceDTO
    evidence_b: StudyEvidenceDTO
    created_at: datetime


class ResearchGapDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    description: str
    known_evidence: str
    uncertain_evidence: str
    missing_evidence: str
    why_it_matters: str
    evidence_coverage: float
    supporting_studies_count: int
    supporting_studies_summary: List[Dict[str, Any]]
    confidence: str
    created_at: datetime


# ----------------- Research Directions (Hypotheses) -----------------

class ScoreBreakdownDTO(BaseModel):
    novelty_score: float
    gap_score: float
    feasibility_score: float
    impact_score: float
    overall_score: float
    tier: str
    formula_display: str

class ResearchDirectionDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    research_question: str
    rationale: str
    observed_evidence_summary: str
    gap_addressed: str
    uncertainty_unresolved: str
    supporting_studies: List[Dict[str, Any]]
    novelty_score: float
    gap_score: float
    feasibility_score: float
    impact_score: float
    overall_score: float
    tier: str
    confidence: str
    is_saved: bool
    created_at: datetime


# ----------------- What-If Analysis -----------------

class WhatIfRequest(BaseModel):
    biomarker: Optional[str] = None
    population: Optional[str] = None
    intervention: Optional[str] = None
    study_type: Optional[str] = None
    outcome: Optional[str] = None

class WhatIfResponse(BaseModel):
    coverage_status: str
    coverage_percentage: float
    total_matching_studies: int
    high_confidence_studies: int
    contradiction_count: int
    potential_gap_detected: bool
    gap_description: Optional[str] = None
    recommended_direction: Optional[str] = None
    matching_evidence: List[StudyEvidenceDTO]


# ----------------- Knowledge Graph -----------------

class GraphNodeDTO(BaseModel):
    id: str
    label: str
    type: str  # Disease, Drug, Biomarker, Study, Population, Outcome, Gap, Hypothesis
    category: Optional[str] = None
    properties: Dict[str, Any] = {}

class GraphEdgeDTO(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    label: Optional[str] = None
    properties: Dict[str, Any] = {}

class KnowledgeGraphDTO(BaseModel):
    nodes: List[GraphNodeDTO]
    edges: List[GraphEdgeDTO]


# ----------------- System Health -----------------

class SystemStatusDTO(BaseModel):
    database: str
    database_type: str
    neo4j: str
    biomedical_api: str
    llm: str
    llm_provider: str
    embeddings: str
    demo_dataset: str
    overall_healthy: bool


# ----------------- Copilot Schemas -----------------

class SourceCitationDTO(BaseModel):
    id: str
    title: str
    authors: Optional[str] = None
    year: Optional[int] = None
    journal: Optional[str] = None
    external_id: Optional[str] = None
    url: Optional[str] = None
    evidence_quote: Optional[str] = None

class CopilotChatRequest(BaseModel):
    project_id: str
    message: str = Field(max_length=8000)
    conversation_id: Optional[str] = None
    context_type: Optional[str] = "project"  # project, paper, contradiction, gap, hypothesis, whatif
    context_id: Optional[str] = None
    page_context: Optional[str] = None

class CopilotChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    sources: List[SourceCitationDTO] = []
    confidence: str = "High"  # High, Medium, Low
    suggested_followups: List[str] = []
    created_at: datetime

class CopilotMessageDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    sources: List[Dict[str, Any]] = []
    confidence: str
    context_type: Optional[str] = None
    context_id: Optional[str] = None
    created_at: datetime

class CopilotConversationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    project_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[CopilotMessageDTO] = []
