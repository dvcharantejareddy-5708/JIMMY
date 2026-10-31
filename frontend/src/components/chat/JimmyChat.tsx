import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  X,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Loader2,
  GitBranch,
  AlertCircle,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { JimmyApi } from '../../services/api';
import { ChatMessage, RepositoryMetadata, GitHubIssue } from '../../types';

interface JimmyChatProps {
  isOpen: boolean;
  onClose: () => void;
  repository?: RepositoryMetadata | null;
  selectedIssue?: GitHubIssue | null;
  graphSummary?: string;
  initialQuestion?: string;
}

export const JimmyChat: React.FC<JimmyChatProps> = ({
  isOpen,
  onClose,
  repository,
  selectedIssue,
  graphSummary,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts based on active context
  const getSuggestedPrompts = () => {
    if (selectedIssue) {
      return [
        `Why is issue #${selectedIssue.number} difficult?`,
        `What should my first step be for this issue?`,
        `Which concepts should I study first?`,
        `What could go wrong during this fix?`,
      ];
    }
    if (repository) {
      return [
        `What does this repository do?`,
        `Explain the architecture and main folders`,
        `How do I install and run this project?`,
        `Where should a beginner start reading the code?`,
      ];
    }
    return [
      `What is open source and how do I make my first PR?`,
      `How does GitHub work? (Forks vs Branches)`,
      `How do I install Git on my machine?`,
      `How do I resolve a merge conflict?`,
    ];
  };

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(getSuggestedPrompts());

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'msg-greeting',
        role: 'assistant',
        content: repository
          ? `Hello! I'm **JIMMY AI Assistant**. I'm currently aware of **${repository.fullName}**${
              selectedIssue ? ` and issue **#${selectedIssue.number}** ("${selectedIssue.title}")` : ''
            }. How can I assist your open-source journey today?`
          : `Hello! I'm **JIMMY AI Assistant**, your open-source mentor. Ask me anything about Git, GitHub, open-source best practices, or enter a repository to explore its codebase together!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: getSuggestedPrompts(),
      };
      setMessages([greeting]);
    }
  }, [repository, selectedIssue]);

  // Handle external initial question trigger
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    setSuggestedPrompts(getSuggestedPrompts());
  }, [repository, selectedIssue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const contextPayload: any = {};
      if (repository) contextPayload.repository = repository;
      if (selectedIssue) contextPayload.issue = selectedIssue;
      if (graphSummary) contextPayload.graphSummary = graphSummary;

      const response = await JimmyApi.chat(text, historyPayload, contextPayload);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: response.suggestedPrompts && response.suggestedPrompts.length > 0
          ? response.suggestedPrompts
          : getSuggestedPrompts(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setSuggestedPrompts(response.suggestedPrompts);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue communicating with Gemma 4: ${err.message || 'Unknown error'}. Please verify Google Cloud Vertex AI ADC configuration.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cleared. How can I help you next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: getSuggestedPrompts(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden ${
        isExpanded
          ? 'inset-4 md:inset-10'
          : 'bottom-4 right-4 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
      }`}
    >
      {/* Chat Header */}
      <div className="bg-midnight px-4 py-3 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-purple flex items-center justify-center text-accent-cyan shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight">JIMMY AI ASSISTANT</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-accent-cyan/20 text-accent-cyan">
                Gemma 4
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate max-w-[220px]">
              {selectedIssue
                ? `Issue #${selectedIssue.number}`
                : repository
                ? repository.fullName
                : 'General Open Source Mentor'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClear}
            title="Clear Conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Expand'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      {(repository || selectedIssue) && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center space-x-1.5 truncate">
            <GitBranch className="w-3 h-3 text-primary-purple shrink-0" />
            <span className="font-medium truncate">{repository?.fullName}</span>
            {selectedIssue && (
              <span className="text-slate-400 truncate">/ #{selectedIssue.number}</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
            Context Active
          </span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-primary-purple" />
                  <span className="font-semibold text-slate-600">JIMMY</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`relative group max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary-purple text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-opacity"
                  title="Copy response"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 rounded-md bg-primary-purple/10 flex items-center justify-center text-primary-purple shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-2xl rounded-bl-none bg-white border border-slate-200 text-xs text-slate-500 flex items-center space-x-2 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-purple" />
              <span>Gemma 4 is reasoning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedPrompts.length > 0 && !loading && (
        <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap shrink-0 flex items-center space-x-1.5 no-scrollbar">
          <Sparkles className="w-3 h-3 text-accent-cyan shrink-0 ml-1" />
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-primary-purple/10 hover:text-primary-purple text-slate-600 border border-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedIssue
                ? `Ask about issue #${selectedIssue.number}...`
                : repository
                ? `Ask about ${repository.name}...`
                : 'Ask JIMMY anything about open-source...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple/30 focus:border-primary-purple transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-primary-purple hover:bg-primary-purple/90 text-white shadow-sm disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
