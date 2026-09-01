import {
  User,
  AuthResponse,
  ResearchProjectSummary,
  ResearchProjectDetail,
  Paper,
  StudyEvidence,
  Contradiction,
  ResearchGap,
  ResearchDirection,
  WhatIfRequest,
  WhatIfResponse,
  KnowledgeGraph,
  SystemStatus,
  CopilotChatRequest,
  CopilotChatResponse,
  CopilotConversation,
  PredefinedTopic,
  TopicMatchResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('researchloop_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('researchloop_token', token);
    } else {
      localStorage.removeItem('researchloop_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('researchloop_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { detail: `HTTP error ${res.status}` };
      }
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  // ----------------- Auth -----------------

  async demoLogin(): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/demo-login', {
      method: 'POST',
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, pass: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(
    name: string,
    email: string,
    pass: string,
    inst?: string,
    field?: string
  ): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: name,
        email,
        password: pass,
        institution: inst,
        research_field: field,
      }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  async getCurrentUser(): Promise<User> {
    return this.getMe();
  }

  async updateProfile(profile: {
    full_name?: string;
    institution?: string;
    research_field?: string;
  }): Promise<User> {
    return this.request<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  logout(): void {
    this.setToken(null);
  }

  // ----------------- Projects & Topics -----------------

  async getPredefinedTopics(): Promise<PredefinedTopic[]> {
    return this.request<PredefinedTopic[]>('/api/research/topics');
  }

  async matchTopic(query: string): Promise<TopicMatchResult> {
    return this.request<TopicMatchResult>('/api/research/match-topic', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getProjects(): Promise<ResearchProjectSummary[]> {
    return this.request<ResearchProjectSummary[]>('/api/research');
  }

  async getProjectDetail(id: string): Promise<ResearchProjectDetail> {
    return this.request<ResearchProjectDetail>(`/api/research/${id}`);
  }

  async createProject(data: {
    query: string;
    title?: string;
    disease?: string;
    intervention?: string;
    biomarker?: string;
    population?: string;
    study_type?: string;
    use_demo_data?: boolean;
  }): Promise<ResearchProjectDetail> {
    return this.request<ResearchProjectDetail>('/api/research', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async triggerAnalysis(id: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/api/research/${id}/analyze`, {
      method: 'POST',
    });
  }

  // ----------------- Evidence & Research Entities -----------------

  async getPapers(projectId: string): Promise<Paper[]> {
    return this.request<Paper[]>(`/api/research/${projectId}/papers`);
  }

  async getEvidence(
    projectId: string,
    filters?: { biomarker?: string; result_type?: string; confidence?: string }
  ): Promise<StudyEvidence[]> {
    const params = new URLSearchParams();
    if (filters?.biomarker && filters.biomarker !== 'All') params.set('biomarker', filters.biomarker);
    if (filters?.result_type && filters.result_type !== 'All') params.set('result_type', filters.result_type);
    if (filters?.confidence && filters.confidence !== 'All') params.set('confidence', filters.confidence);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<StudyEvidence[]>(`/api/research/${projectId}/evidence${qs}`);
  }

  async getFailures(projectId: string): Promise<StudyEvidence[]> {
    return this.request<StudyEvidence[]>(`/api/research/${projectId}/failures`);
  }

  async getContradictions(projectId: string): Promise<Contradiction[]> {
    return this.request<Contradiction[]>(`/api/research/${projectId}/contradictions`);
  }

  async getGaps(projectId: string): Promise<ResearchGap[]> {
    return this.request<ResearchGap[]>(`/api/research/${projectId}/gaps`);
  }

  async getHypotheses(projectId: string, savedOnly?: boolean): Promise<ResearchDirection[]> {
    const qs = savedOnly ? '?saved_only=true' : '';
    return this.request<ResearchDirection[]>(`/api/research/${projectId}/hypotheses${qs}`);
  }

  async toggleSaveDirection(projectId: string, directionId: string): Promise<ResearchDirection> {
    return this.request<ResearchDirection>(`/api/research/${projectId}/hypotheses/${directionId}/save`, {
      method: 'POST',
    });
  }

  // ----------------- What-If & Knowledge Graph -----------------

  async simulateWhatIf(projectId: string, criteria: WhatIfRequest): Promise<WhatIfResponse> {
    return this.request<WhatIfResponse>(`/api/research/${projectId}/whatif`, {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  async runWhatIf(projectId: string, criteria: WhatIfRequest): Promise<WhatIfResponse> {
    return this.simulateWhatIf(projectId, criteria);
  }

  async getKnowledgeGraph(projectId: string): Promise<KnowledgeGraph> {
    return this.request<KnowledgeGraph>(`/api/research/${projectId}/graph`);
  }

  // ----------------- System Status -----------------

  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/system/status');
  }

  // ----------------- Copilot API -----------------

  async copilotChat(req: CopilotChatRequest): Promise<CopilotChatResponse> {
    return this.request<CopilotChatResponse>('/api/copilot/chat', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async getCopilotConversations(projectId: string): Promise<CopilotConversation[]> {
    return this.request<CopilotConversation[]>(`/api/copilot/conversations/${projectId}`);
  }

  async getCopilotConversation(projectId: string, conversationId: string): Promise<CopilotConversation> {
    return this.request<CopilotConversation>(`/api/copilot/conversations/${projectId}/${conversationId}`);
  }

  async deleteCopilotConversation(projectId: string, conversationId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/api/copilot/conversations/${projectId}/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async clearCopilotConversations(projectId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/api/copilot/conversations/${projectId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
