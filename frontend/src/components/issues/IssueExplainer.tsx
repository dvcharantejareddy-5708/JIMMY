import React, { useState } from 'react';
import {
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  FolderTree,
  Gauge,
  PlayCircle,
  RotateCcw,
  ArrowRight,
  Loader2,
  Tag,
  Copy,
  Check,
  ExternalLink,
  Bot,
  ShieldAlert,
  Lightbulb,
  FileCode,
} from 'lucide-react';
import { GitHubIssue, IssueExplanation, RepositoryMetadata } from '../../types';

interface IssueExplainerProps {
  issue: GitHubIssue;
  explanation: IssueExplanation | null;
  isLoading: boolean;
  onExplainAgain: (simplified?: boolean) => Promise<void>;
  onNavigateToRoadmap: () => void;
  onNavigateToGraph: () => void;
  onAskAI?: (question: string) => void;
  repoMetadata: RepositoryMetadata;
}

export const IssueExplainer: React.FC<IssueExplainerProps> = ({
  issue,
  explanation,
  isLoading,
  onExplainAgain,
  onNavigateToRoadmap,
  onNavigateToGraph,
  onAskAI,
  repoMetadata,
}) => {
  const [isReExplaining, setIsReExplaining] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReExplain = async (simplified: boolean = false) => {
    if (simplified) {
      setIsSimplifying(true);
    } else {
      setIsReExplaining(true);
    }
    try {
      await onExplainAgain(simplified);
    } finally {
      setIsReExplaining(false);
      setIsSimplifying(false);
    }
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    const text = `=== JIMMY ISSUE EXPLANATION ===
Issue #${issue.number}: ${issue.title}
Repository: ${repoMetadata.fullName}

A. UNDERSTAND THE PROBLEM:
${explanation.problemDescription}

B. WHY DOES THIS MATTER?:
${explanation.whyItMatters}

C. WHAT NEEDS TO BE FIXED?:
${explanation.whatNeedsToBeFixed}

D. TECHNICAL TERMS EXPLAINED:
${explanation.technicalTerms?.map((t) => `- ${t.term}: ${t.explanation}`).join('\n') || 'None'}

E. KNOWLEDGE REQUIRED:
${explanation.knowledgeRequired?.map((k) => `- ${k}`).join('\n') || 'None'}

F. POSSIBLE DIFFICULTY:
${explanation.possibleDifficulty} — ${explanation.difficultyReason}

G. POSSIBLE FILES TO INVESTIGATE:
${explanation.possibleFilesToInvestigate?.map((f) => `- ${f}`).join('\n') || 'None'}

H. FIRST ACTION:
${explanation.firstAction || (explanation as any).suggestedFirstAction}

I. THINGS TO BE CAREFUL ABOUT:
${explanation.thingsToBeCarefulAbout?.map((c) => `- ${c}`).join('\n') || 'None'}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const difficultyColors = {
    'Very Easy': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Easy': 'bg-blue-100 text-blue-800 border-blue-300',
    'Medium': 'bg-amber-100 text-amber-800 border-amber-300',
    'Hard': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="space-y-6">
      {/* Issue Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-primary-purple">Issue #{issue.number}</span>
              <span>•</span>
              <span>Opened by @{issue.author.login}</span>
              <span>•</span>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-midnight leading-tight">
              {issue.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyExplanation}
              disabled={!explanation}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-40"
              title="Copy structured explanation"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied!' : 'Copy Explanation'}
            </button>
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-white bg-midnight hover:bg-midnight/90 shadow-sm transition-colors"
            >
              <span>Open on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </div>
        </div>

        {/* Labels & Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {(issue.labels || []).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Tag className="w-3 h-3 mr-1 text-slate-400" />
              {label.name}
            </span>
          ))}
          {explanation && (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                difficultyColors[explanation.possibleDifficulty] || 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Difficulty: {explanation.possibleDifficulty}
            </span>
          )}
          {explanation?.isSimplified && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-primary-purple border border-purple-200">
              Simplified Mode
            </span>
          )}
        </div>
      </div>

      {/* AI Explanation Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary-purple animate-spin mx-auto" />
          <h4 className="text-base font-bold text-midnight">JIMMY is Deconstructing this Issue...</h4>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Gemma 4 on Vertex AI is translating the issue into 9 beginner-friendly, structured sections.
          </p>
        </div>
      ) : explanation ? (
        <div className="space-y-4">
          {/* Section A: UNDERSTAND THE PROBLEM */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-2">
            <div className="flex items-center space-x-2 text-primary-purple">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold tracking-wider uppercase">A. UNDERSTAND THE PROBLEM</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed pl-7">
              {explanation.problemDescription}
            </p>
          </div>

          {/* Section B: WHY DOES THIS MATTER? */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-2">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold tracking-wider uppercase">B. WHY DOES THIS MATTER?</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-7">
              {explanation.whyItMatters}
            </p>
          </div>

          {/* Section C: WHAT NEEDS TO BE FIXED? */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-xs font-bold tracking-wider uppercase">C. WHAT NEEDS TO BE FIXED?</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-7">
              {explanation.whatNeedsToBeFixed}
            </p>
          </div>

          {/* Section D: TECHNICAL TERMS EXPLAINED */}
          {explanation.technicalTerms && explanation.technicalTerms.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-accent-cyan">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  D. TECHNICAL TERMS EXPLAINED
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                {explanation.technicalTerms.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-xs text-primary-purple block">{t.term}</span>
                    <span className="text-xs text-slate-600 leading-relaxed mt-0.5 block">{t.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid: E. KNOWLEDGE REQUIRED & F. DIFFICULTY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section E: KNOWLEDGE REQUIRED */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <BookOpen className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-xs font-bold tracking-wider uppercase">E. KNOWLEDGE REQUIRED</h3>
              </div>
              <ul className="space-y-2 pl-7">
                {explanation.knowledgeRequired?.map((concept, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 mr-2 shrink-0" />
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section F: POSSIBLE DIFFICULTY */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <Gauge className="w-5 h-5 text-primary-purple" />
                <h3 className="text-xs font-bold tracking-wider uppercase">F. POSSIBLE DIFFICULTY</h3>
              </div>
              <div className="pl-7 space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-bold border ${
                    difficultyColors[explanation.possibleDifficulty] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {explanation.possibleDifficulty}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {explanation.difficultyReason}
                </p>
              </div>
            </div>
          </div>

          {/* Section G: POSSIBLE FILES TO INVESTIGATE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800">
                <FolderTree className="w-5 h-5 text-primary-purple" />
                <h3 className="text-xs font-bold tracking-wider uppercase">
                  G. POSSIBLE FILES TO INVESTIGATE
                </h3>
              </div>
              <button
                onClick={onNavigateToGraph}
                className="text-xs font-semibold text-primary-purple hover:underline inline-flex items-center"
              >
                Inspect in Graphify Code Explorer
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            <div className="pl-7 space-y-2">
              {explanation.possibleFilesToInvestigate?.map((file, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-soft-bg border border-slate-200 font-mono text-xs text-slate-700 flex items-center space-x-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section I: THINGS TO BE CAREFUL ABOUT */}
          {explanation.thingsToBeCarefulAbout && explanation.thingsToBeCarefulAbout.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-amber-200/80 bg-amber-50/20 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-amber-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-xs font-bold tracking-wider uppercase">
                  I. THINGS TO BE CAREFUL ABOUT
                </h3>
              </div>
              <ul className="space-y-2 pl-7">
                {explanation.thingsToBeCarefulAbout.map((risk, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-amber-900 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section H: FIRST ACTION & Interactive Command Bar */}
          <div className="bg-gradient-to-tr from-midnight via-deep-navy to-midnight rounded-2xl p-6 text-white shadow-xl shadow-slate-300/40 space-y-4">
            <div className="flex items-center space-x-2 text-accent-cyan">
              <PlayCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold tracking-wider uppercase">H. WHAT SHOULD YOU DO FIRST?</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-200 pl-7 leading-relaxed font-medium">
              {explanation.firstAction || (explanation as any).suggestedFirstAction}
            </p>

            {/* Quick Actions Strip */}
            <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReExplain(false)}
                  disabled={isReExplaining || isSimplifying}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isReExplaining ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Regenerate
                </button>

                <button
                  onClick={() => handleReExplain(true)}
                  disabled={isReExplaining || isSimplifying}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium text-purple-200 hover:text-white bg-primary-purple/30 hover:bg-primary-purple/50 border border-primary-purple/40 transition-colors disabled:opacity-50"
                >
                  {isSimplifying ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-accent-cyan" />
                  )}
                  Explain More Simply
                </button>

                {onAskAI && (
                  <button
                    onClick={() => onAskAI(`Can you explain issue #${issue.number} ("${issue.title}") in more detail?`)}
                    className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium text-cyan-200 hover:text-white bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 mr-1.5 text-accent-cyan" />
                    Ask AI About This
                  </button>
                )}
              </div>

              <button
                onClick={onNavigateToRoadmap}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-midnight bg-accent-cyan hover:bg-accent-cyan/90 transition-all shadow-md shadow-accent-cyan/20"
              >
                Generate Contribution Roadmap
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <p className="text-sm text-slate-600">No explanation generated yet.</p>
          <button
            onClick={() => onExplainAgain(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-purple hover:bg-primary-purple/90"
          >
            Explain This Issue with JIMMY
          </button>
        </div>
      )}
    </div>
  );
};
