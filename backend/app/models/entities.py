import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Enum,
)
from sqlalchemy.orm import relationship as orm_relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=True)
    research_field = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = orm_relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    query = Column(Text, nullable=False)
    disease = Column(String(255), nullable=True)
    intervention = Column(String(255), nullable=True)
    biomarker = Column(String(255), nullable=True)
    population = Column(String(255), nullable=True)
    study_type = Column(String(255), nullable=True)
    status = Column(String(50), default="COMPLETED")  # CREATED, FETCHING, EXTRACTING, ANALYZING, GENERATING, COMPLETED, FAILED
    status_message = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    paper_count = Column(Integer, default=0)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = orm_relationship("User", back_populates="projects")
    papers = orm_relationship("Paper", back_populates="project", cascade="all, delete-orphan")
    evidence = orm_relationship("StudyEvidence", back_populates="project", cascade="all, delete-orphan")
    contradictions = orm_relationship("Contradiction", back_populates="project", cascade="all, delete-orphan")
    gaps = orm_relationship("ResearchGap", back_populates="project", cascade="all, delete-orphan")
    hypotheses = orm_relationship("ResearchDirection", back_populates="project", cascade="all, delete-orphan")
    graph_nodes = orm_relationship("GraphNode", back_populates="project", cascade="all, delete-orphan")
    graph_edges = orm_relationship("GraphEdge", back_populates="project", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    source = Column(String(50), default="PubMed")  # PubMed, Europe PMC, Demo Dataset
    external_id = Column(String(100), nullable=True, index=True)  # PMID or Europe PMC ID
    doi = Column(String(100), nullable=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    authors = Column(Text, nullable=True)
    journal = Column(String(255), nullable=True)
    publication_year = Column(Integer, nullable=True)
    url = Column(String(500), nullable=True)
    citation_count = Column(Integer, default=0)
    study_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = orm_relationship("ResearchProject", back_populates="papers")
    evidence_items = orm_relationship("StudyEvidence", back_populates="paper", cascade="all, delete-orphan")


class StudyEvidence(Base):
    __tablename__ = "study_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    paper_id = Column(String(36), ForeignKey("papers.id"), nullable=False, index=True)
    
    study_label = Column(String(255), nullable=False)  # e.g., "Smith et al., 2024"
    year = Column(Integer, nullable=True)
    disease = Column(String(255), nullable=True)
    intervention = Column(String(255), nullable=True)
    comparator = Column(String(255), nullable=True)
    population = Column(String(255), nullable=True)
    biomarker = Column(String(255), nullable=True)
    study_type = Column(String(100), nullable=True)
    sample_size = Column(Integer, nullable=True)
    sample_size_display = Column(String(50), nullable=True)  # e.g., "n=240"
    
    primary_outcome = Column(String(255), nullable=True)
    result_type = Column(String(50), nullable=False)  # positive, negative, null, mixed, inconclusive
    result_category = Column(String(100), nullable=True)  # e.g. "Improved response", "Null result", "Early termination"
    result_summary = Column(Text, nullable=False)
    effect_description = Column(Text, nullable=True)
    evidence_text = Column(Text, nullable=False)  # Exact quote / provenance from abstract
    confidence = Column(String(20), default="High")  # High, Medium, Low
    confidence_rationale = Column(Text, nullable=True)
    
    is_negative_finding = Column(Boolean, default=False)
    negative_classification = Column(String(100), nullable=True)  # Null result, Failed replication, Early termination, Adverse outcome, Limited efficacy
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = orm_relationship("ResearchProject", back_populates="evidence")
    paper = orm_relationship("Paper", back_populates="evidence_items")


class Contradiction(Base):
    __tablename__ = "contradictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    
    evidence_a_id = Column(String(36), ForeignKey("study_evidence.id"), nullable=False)
    evidence_b_id = Column(String(36), ForeignKey("study_evidence.id"), nullable=False)
    
    topic = Column(String(255), nullable=False)  # e.g., "Drug A Response in Biomarker Groups"
    summary = Column(Text, nullable=False)
    
    # Potential contributing factors
    population_diff = Column(String(255), nullable=True)
    biomarker_diff = Column(String(255), nullable=True)
    dosage_diff = Column(String(255), nullable=True)
    endpoint_diff = Column(String(255), nullable=True)
    study_design_diff = Column(String(255), nullable=True)
    sample_size_diff = Column(String(255), nullable=True)
    
    possible_explanation = Column(Text, nullable=False)
    confidence = Column(String(20), default="High")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = orm_relationship("ResearchProject", back_populates="contradictions")
    evidence_a = orm_relationship("StudyEvidence", foreign_keys=[evidence_a_id])
    evidence_b = orm_relationship("StudyEvidence", foreign_keys=[evidence_b_id])


class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    known_evidence = Column(Text, nullable=False)
    uncertain_evidence = Column(Text, nullable=False)
    missing_evidence = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    
    evidence_coverage = Column(Float, default=30.0)  # 0 to 100
    supporting_studies_count = Column(Integer, default=0)
    supporting_studies_summary = Column(JSON, default=list)  # List of study label dicts
    confidence = Column(String(20), default="Medium")
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = orm_relationship("ResearchProject", back_populates="gaps")


class ResearchDirection(Base):
    __tablename__ = "research_directions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    
    research_question = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    observed_evidence_summary = Column(Text, nullable=False)
    gap_addressed = Column(Text, nullable=False)
    uncertainty_unresolved = Column(Text, nullable=False)
    supporting_studies = Column(JSON, default=list)  # [{id, title, author, result_type}]
    
    novelty_score = Column(Float, default=0.0)
    gap_score = Column(Float, default=0.0)
    feasibility_score = Column(Float, default=0.0)
    impact_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    
    tier = Column(String(50), default="High")  # High opportunity, Strong, Moderate, Low opportunity
    confidence = Column(String(20), default="Medium")
    is_saved = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    project = orm_relationship("ResearchProject", back_populates="hypotheses")


class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(String(100), primary_key=True)  # Unique ID, e.g., "drug-osimertinib"
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)  # Disease, Drug, Biomarker, Study, Population, Outcome, Gap, Hypothesis
    label = Column(String(255), nullable=False)
    category = Column(String(50), nullable=True)
    properties = Column(JSON, default=dict)
    
    project = orm_relationship("ResearchProject", back_populates="graph_nodes")


class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(String(100), primary_key=True)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    source_id = Column(String(100), nullable=False, index=True)
    target_id = Column(String(100), nullable=False, index=True)
    relationship = Column(String(50), nullable=False)  # STUDIES, TARGETS, TESTED_IN, HAS_OUTCOME, SUPPORTS, CONTRADICTS, IDENTIFIES_GAP, SUGGESTS
    label = Column(String(100), nullable=True)
    properties = Column(JSON, default=dict)
    
    project = orm_relationship("ResearchProject", back_populates="graph_edges")


class CopilotConversation(Base):
    __tablename__ = "copilot_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Research Exploration")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = orm_relationship("CopilotMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="CopilotMessage.created_at")


class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("copilot_conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list)  # [{id, title, authors, year, journal, external_id}]
    confidence = Column(String(20), default="Medium")  # High, Medium, Low
    context_type = Column(String(50), nullable=True)  # project, paper, contradiction, gap, hypothesis, whatif
    context_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = orm_relationship("CopilotConversation", back_populates="messages")

