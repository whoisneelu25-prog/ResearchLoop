import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  History,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Dna,
  Layers,
  Flame,
  SearchCode,
  Lightbulb,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useCopilot } from '../../context/CopilotContext';
import { api } from '../../services/api';
import { CopilotMessage, SourceCitation, CopilotConversation, StudyEvidence, Paper } from '../../types';
import { CopilotMessageItem } from './CopilotMessageItem';
import { PaperDrawer } from '../evidence/PaperDrawer';

export const CopilotDrawer: React.FC = () => {
  const {
    isOpen,
    closeCopilot,
    activeProjectId,
    initialQuery,
    initialContext,
    clearInitialQuery,
    currentPageContext,
  } = useCopilot();

  const [projectTitle, setProjectTitle] = useState<string>('Lung Cancer & Drug Response');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<CopilotConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCitationEvidence, setSelectedCitationEvidence] = useState<StudyEvidence | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load project info and conversation history when active project changes
  useEffect(() => {
    if (!activeProjectId) return;

    api.getProjectDetail(activeProjectId)
      .then((p) => setProjectTitle(p.title))
      .catch((e) => console.error(e));

    loadConversations();
  }, [activeProjectId]);

  const loadConversations = async () => {
    if (!activeProjectId) return;
    try {
      const list = await api.getCopilotConversations(activeProjectId);
      setConversations(list);
    } catch (e) {
      console.error('Error fetching copilot conversations:', e);
    }
  };

  // Handle initial trigger query if dispatched from "Ask Copilot" action button
  useEffect(() => {
    if (isOpen && initialQuery && activeProjectId) {
      const q = initialQuery;
      const ctx = initialContext;
      clearInitialQuery();
      handleSendMessage(q, ctx?.type, ctx?.id);
    }
  }, [isOpen, initialQuery, activeProjectId]);

  const handleSendMessage = async (queryText?: string, ctxType?: string, ctxId?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || !activeProjectId || loading) return;

    setError(null);
    setInputMessage('');

    // Optimistically add user message
    const tempUserMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      conversation_id: conversationId || 'temp',
      role: 'user',
      content: textToSend.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.copilotChat({
        project_id: activeProjectId,
        message: textToSend.trim(),
        conversation_id: conversationId || undefined,
        context_type: ctxType || 'project',
        context_id: ctxId || undefined,
        page_context: currentPageContext,
      });

      setConversationId(res.conversation_id);

      const assistantMsg: CopilotMessage = {
        id: res.message_id,
        conversation_id: res.conversation_id,
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        created_at: res.created_at,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadConversations();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not retrieve copilot response. Please check AI configuration and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = async (conv: CopilotConversation) => {
    if (!activeProjectId) return;
    setLoading(true);
    setError(null);
    try {
      const fullConv = await api.getCopilotConversation(activeProjectId, conv.id);
      setConversationId(fullConv.id);
      setMessages(fullConv.messages || []);
      setShowHistory(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
    setError(null);
  };

  const handleClearHistory = async () => {
    if (!activeProjectId) return;
    try {
      await api.clearCopilotConversations(activeProjectId);
      setConversations([]);
      handleNewChat();
    } catch (e) {
      console.error(e);
    }
  };

  // Open PaperDrawer when a source citation is clicked
  const handleOpenSourceCitation = async (src: SourceCitation) => {
    if (!activeProjectId) return;
    try {
      const allEv = await api.getEvidence(activeProjectId);
      const match = allEv.find((e) => e.paper_id === src.id || e.paper?.title === src.title);
      if (match) {
        setSelectedCitationEvidence(match);
      } else {
        // Construct fallback evidence object to display paper excerpt
        const mockEv: StudyEvidence = {
          id: src.id,
          paper_id: src.id,
          project_id: activeProjectId,
          study_label: src.authors ? `${src.authors.split(',')[0]} et al.` : 'Targeted Study',
          year: src.year,
          result_type: 'positive',
          result_summary: src.title,
          evidence_text: src.evidence_quote || src.title,
          confidence: 'High',
          is_negative_finding: false,
          paper: {
            id: src.id,
            project_id: activeProjectId,
            source: 'PubMed',
            title: src.title,
            authors: src.authors,
            journal: src.journal,
            publication_year: src.year,
            url: src.url,
            citation_count: 0,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        };
        setSelectedCitationEvidence(mockEv);
      }
    } catch (e) {
      console.error('Error opening source drawer:', e);
    }
  };

  // Context-sensitive suggested questions
  const getContextQuestions = () => {
    switch (currentPageContext) {
      case 'evidence':
        return [
          'Which studies have the strongest evidence?',
          'What are the major positive findings?',
          'Which findings are uncertain or mixed?',
        ];
      case 'failures':
        return [
          'What were the main negative findings?',
          'What caused the early trial terminations?',
          'What factors explain the negative results in Biomarker X- patients?',
        ];
      case 'contradictions':
        return [
          'Why are these studies contradictory?',
          'How do their patient populations and biomarkers differ?',
          'Do the trial endpoints explain the disagreement?',
        ];
      case 'gaps':
        return [
          'What are the biggest research gaps?',
          'Why is there an evidence deficit in Biomarker X- cohorts?',
          'What missing evidence is needed to resolve current uncertainties?',
        ];
      case 'hypotheses':
        return [
          'Why was this research direction suggested?',
          'How was the 82/100 opportunity score calculated?',
          'What supporting evidence connects the contradiction to this hypothesis?',
        ];
      default:
        return [
          'Why are these studies contradictory?',
          'What were the main negative findings?',
          'What are the biggest research gaps?',
          'Why was this research direction suggested?',
          'What happens if we focus only on Biomarker X- patients?',
        ];
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">ResearchLoop Copilot</h3>
                <span className="text-[9px] font-bold uppercase bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded border border-brand-200">
                  RAG
                </span>
              </div>
              <p className="text-[10px] text-slate-500">AI assistant for exploring research evidence</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Conversation History"
              className={`p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-standard ${
                showHistory ? 'bg-slate-100 text-brand-600' : ''
              }`}
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewChat}
              title="New Conversation"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-standard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={closeCopilot}
              title="Close Copilot"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-standard ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Project Banner */}
        <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-400 font-semibold uppercase text-[9px]">Analyzing:</span>
            <span className="font-bold text-slate-800 truncate">{projectTitle}</span>
          </div>
          <span className="text-[10px] text-brand-600 font-medium capitalize bg-white px-2 py-0.5 rounded border border-slate-200">
            {currentPageContext} View
          </span>
        </div>

        {/* Conversation History Drawer Overlay */}
        {showHistory && (
          <div className="p-3 bg-white border-b border-slate-200 shadow-sm space-y-2 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Saved Conversations ({conversations.length})</span>
              {conversations.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No previous conversations for this project.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-2 rounded text-xs flex items-center justify-between transition-standard ${
                      conv.id === conversationId
                        ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2">{conv.title}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Initial Screen when no messages */}
          {messages.length === 0 ? (
            <div className="py-4 space-y-5">
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-brand-600 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>ResearchLoop Copilot</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  I'm connected to your current research project dataset. I can help you interrogate:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>Clinical Evidence</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span>Negative Findings</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span>Contradictions</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /><span>Research Gaps</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /><span>Research Directions</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-700" /><span>What-If Scenarios</span></div>
                </div>
              </div>

              {/* Context-Sensitive Suggested Questions */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Suggested Questions for {currentPageContext}:
                </span>
                <div className="space-y-1.5">
                  {getContextQuestions().map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-left p-2.5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-brand-300 rounded-lg text-xs font-medium text-slate-800 transition-standard shadow-xs flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <CopilotMessageItem
                key={msg.id}
                message={msg}
                onSelectSource={handleOpenSourceCitation}
              />
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-800">Analyzing the research evidence...</div>
                <div className="text-[10px] text-slate-400">Retrieving relevant papers, contradictions, and gaps</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Copilot Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this research (e.g. Why are these studies contradictory?)..."
                maxLength={8000}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg shadow-xs transition-standard flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
            <span>Evidence-grounded RAG</span>
          </div>
        </div>
      </div>

      {/* Paper Drawer when user clicks a cited source */}
      {selectedCitationEvidence && (
        <PaperDrawer
          evidence={selectedCitationEvidence}
          onClose={() => setSelectedCitationEvidence(null)}
        />
      )}
    </>
  );
};
