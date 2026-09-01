import React from 'react';
import { Bot, User, Sparkles, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { CopilotMessage, SourceCitation } from '../../types';

interface CopilotMessageItemProps {
  message: CopilotMessage;
  onSelectSource?: (source: SourceCitation) => void;
}

export const CopilotMessageItem: React.FC<CopilotMessageItemProps> = ({
  message,
  onSelectSource,
}) => {
  const isUser = message.role === 'user';

  // Format assistant response text to render markdown-like structures cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-xs mt-2.5 mb-1 text-brand-700">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="pl-3 py-1 my-1.5 border-l-2 border-brand-400 bg-brand-50/50 text-slate-700 italic rounded-r text-[11px]"
              >
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }

          // Bullet point
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="text-brand-500 font-bold">•</span>
                <span>{renderTextWithBold(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered point
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                  <span className="font-bold text-brand-600 min-w-[14px]">{match[1]}.</span>
                  <span>{renderTextWithBold(match[2])}</span>
                </div>
              );
            }
          }

          return <p key={idx}>{renderTextWithBold(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Helper to parse **bold** text and [1] citation markers
  const renderTextWithBold = (text: string) => {
    // Split by **bold** or [number]
    const parts = text.split(/(\*\*.*?\*\*|\[\d+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^\[\d+\]$/.test(part)) {
        return (
          <span
            key={i}
            className="inline-flex items-center px-1 mx-0.5 py-0.2 bg-blue-100 text-brand-700 font-bold text-[10px] rounded hover:bg-blue-200 cursor-pointer transition-standard select-none"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] rounded-xl p-3.5 shadow-xs transition-standard ${
          isUser
            ? 'bg-brand-500 text-white rounded-br-xs'
            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
        }`}
      >
        {isUser ? (
          <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="space-y-3">
            {/* Formatted Content */}
            {renderFormattedContent(message.content)}

            {/* Confidence Badge */}
            {message.confidence && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-slate-600">Evidence Confidence:</span>
                  <span
                    className={`font-bold ${
                      message.confidence === 'High'
                        ? 'text-emerald-700'
                        : message.confidence === 'Medium'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {message.confidence}
                  </span>
                </span>
                <span className="text-slate-400">Grounded in Project Dataset</span>
              </div>
            )}

            {/* Sources Citations Section */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-brand-600" />
                  <span>Cited Source Studies ({message.sources.length})</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {message.sources.map((src, sIdx) => (
                    <button
                      key={src.id || sIdx}
                      type="button"
                      onClick={() => onSelectSource && onSelectSource(src)}
                      className="text-left p-2 rounded-md bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-brand-300 transition-standard group flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-brand-700 truncate group-hover:text-brand-800">
                          [{sIdx + 1}] {src.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                          {src.authors} • {src.journal} ({src.year})
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-600 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
