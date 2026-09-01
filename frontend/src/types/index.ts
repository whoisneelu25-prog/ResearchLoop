export interface User {
  id: string;
  email: string;
  full_name: string;
  institution?: string;
  research_field?: string;
  is_demo: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ResearchProjectSummary {
  id: string;
  title: string;
  query: string;
  disease?: string;
  intervention?: string;
  biomarker?: string;
  status: string;
  status_message?: string;
  paper_count: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchProjectDetail {
  id: string;
  title: string;
  query: string;
  disease?: string;
  intervention?: string;
  biomarker?: string;
  population?: string;
  study_type?: string;
  status: string;
  status_message?: string;
  summary?: string;
  paper_count: number;
  negative_count: number;
  contradiction_count: number;
  gap_count: number;
  direction_count: number;
  evidence_distribution: Record<string, number>;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: string;
  project_id: string;
  source: string;
  external_id?: string;
  doi?: string;
  title: string;
  abstract?: string;
  authors?: string;
  journal?: string;
  publication_year?: number;
  url?: string;
  study_type?: string;
  citation_count: number;
  created_at: string;
}

export interface StudyEvidence {
  id: string;
  paper_id: string;
  project_id: string;
  study_label: string;
  year?: number;
  disease?: string;
  intervention?: string;
  comparator?: string;
  population?: string;
  biomarker?: string;
  study_type?: string;
  sample_size?: number;
  sample_size_display?: string;
  primary_outcome?: string;
  result_type: 'positive' | 'negative' | 'null' | 'mixed';
  result_category?: string;
  result_summary: string;
  effect_description?: string;
  evidence_text: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_rationale?: string;
  is_negative_finding: boolean;
  negative_classification?: string;
  paper?: Paper;
  created_at: string;
}

export interface Contradiction {
  id: string;
  project_id: string;
  topic: string;
  summary: string;
  population_diff?: string;
  biomarker_diff?: string;
  dosage_diff?: string;
  endpoint_diff?: string;
  study_design_diff?: string;
  sample_size_diff?: string;
  possible_explanation: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidence_a: StudyEvidence;
  evidence_b: StudyEvidence;
  created_at: string;
}

export interface ResearchGap {
  id: string;
  project_id: string;
  title: string;
  description: string;
  known_evidence: string;
  uncertain_evidence: string;
  missing_evidence: string;
  why_it_matters: string;
  evidence_coverage: number;
  supporting_studies_count: number;
  supporting_studies_summary: Array<{ title: string; authors: string; year: number }>;
  confidence: 'High' | 'Medium' | 'Low';
  created_at: string;
}

export interface ResearchDirection {
  id: string;
  project_id: string;
  research_question: string;
  rationale: string;
  observed_evidence_summary: string;
  gap_addressed: string;
  uncertainty_unresolved: string;
  supporting_studies: Array<{ title: string; authors: string; year: number }>;
  novelty_score: number;
  gap_score: number;
  feasibility_score: number;
  impact_score: number;
  overall_score: number;
  tier: 'High opportunity' | 'Strong opportunity' | 'Moderate opportunity' | 'Low opportunity';
  confidence: 'High' | 'Medium' | 'Low';
  is_saved: boolean;
  created_at: string;
}

export interface ScoreBreakdown {
  novelty_score: number;
  gap_score: number;
  feasibility_score: number;
  impact_score: number;
  overall_score: number;
  tier: string;
  formula_display: string;
}

export interface WhatIfRequest {
  biomarker?: string;
  population?: string;
  intervention?: string;
  study_type?: string;
  outcome?: string;
}

export interface WhatIfResponse {
  coverage_status: string;
  coverage_percentage: number;
  total_matching_studies: number;
  high_confidence_studies: number;
  contradiction_count: number;
  potential_gap_detected: boolean;
  gap_description?: string;
  recommended_direction?: string;
  matching_evidence: StudyEvidence[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Disease' | 'Drug' | 'Biomarker' | 'Study' | 'Population' | 'Outcome' | 'Gap' | 'Hypothesis';
  category?: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label?: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SystemStatus {
  database: string;
  database_type: string;
  neo4j: string;
  biomedical_api: string;
  llm: string;
  llm_provider: string;
  embeddings: string;
  demo_dataset: string;
  overall_healthy: boolean;
}

// ----------------- Copilot Interfaces -----------------

export interface SourceCitation {
  id: string;
  title: string;
  authors?: string;
  year?: number;
  journal?: string;
  external_id?: string;
  url?: string;
  evidence_quote?: string;
}

export interface CopilotMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceCitation[];
  confidence?: 'High' | 'Medium' | 'Low';
  context_type?: string;
  context_id?: string;
  created_at: string;
}

export interface CopilotConversation {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: CopilotMessage[];
}

export interface CopilotChatRequest {
  project_id: string;
  message: string;
  conversation_id?: string;
  context_type?: string;
  context_id?: string;
  page_context?: string;
}

export interface CopilotChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  sources: SourceCitation[];
  confidence: 'High' | 'Medium' | 'Low';
  suggested_followups: string[];
  created_at: string;
}

export interface PredefinedTopic {
  id: string;
  title: string;
  disease?: string;
  intervention?: string;
  biomarker?: string;
  population?: string;
  summary?: string;
  paper_count: number;
  contradiction_count: number;
  gap_count: number;
  direction_count: number;
}

export interface TopicMatchResult {
  matched_topic: PredefinedTopic | null;
  confidence_score: number;
  is_auto_match: boolean;
  alternatives: Array<{
    topic_id: string;
    title: string;
    confidence: number;
  }>;
}

