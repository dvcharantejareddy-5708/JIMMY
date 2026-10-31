import React, { useState } from 'react';
import {
  Star,
  GitFork,
  AlertCircle,
  ExternalLink,
  Code2,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Users,
  CheckCircle,
  FileText,
  Layers,
  Network,
  ListTodo,
  MessageSquare,
  Bot,
} from 'lucide-react';
import {
  RepositoryMetadata,
  RepositoryExplanation,
  GitHubIssue,
  IssueExplanation,
  ContributionRoadmap as IRoadmap,
  GraphifyResult,
} from '../types';
import { IssueFinder } from '../components/issues/IssueFinder';
import { IssueExplainer } from '../components/issues/IssueExplainer';
import { CodeExplorer } from '../components/graph/CodeExplorer';
import { ContributionRoadmap } from '../components/roadmap/ContributionRoadmap';
import { ProjectSetupGuide } from '../components/repository/ProjectSetupGuide';

interface DashboardPageProps {
  metadata: RepositoryMetadata;
  explanation: RepositoryExplanation | null;
  isExplainingRepo: boolean;
  issues: GitHubIssue[];
  isLoadingIssues: boolean;
  issuesError: string | null;
  onRetryIssues: () => void;
  selectedIssue: GitHubIssue | null;
  onSelectIssue: (issue: GitHubIssue) => void;
  issueExplanation: IssueExplanation | null;
  isLoadingIssueExplanation: boolean;
  onExplainIssueAgain: (simplified?: boolean) => Promise<void>;
  roadmap: IRoadmap | null;
  isLoadingRoadmap: boolean;
  onGenerateRoadmap: () => void;
  graphData: GraphifyResult | null;
  isLoadingGraph: boolean;
  onRetryGraph: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenChat: (initialPrompt?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metadata,
  explanation,
  isExplainingRepo,
  issues,
  isLoadingIssues,
  issuesError,
  onRetryIssues,
  selectedIssue,
  onSelectIssue,
  issueExplanation,
  isLoadingIssueExplanation,
  onExplainIssueAgain,
  roadmap,
  isLoadingRoadmap,
  onGenerateRoadmap,
  graphData,
  isLoadingGraph,
  onRetryGraph,
  onShowToast,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'issues' | 'explainer' | 'graph' | 'roadmap'>('overview');

  const handleSelectIssueFromFinder = (issue: GitHubIssue) => {
    onSelectIssue(issue);
    setActiveTab('explainer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Repository Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-500 uppercase">Public Repository</span>
              {metadata.license && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {metadata.license}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight tracking-tight flex items-center flex-wrap gap-2">
              <span>{metadata.owner}</span>
              <span className="text-slate-400 font-light">/</span>
              <span className="text-primary-purple">{metadata.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-brand-muted max-w-3xl leading-relaxed">
              {metadata.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenChat(`Can you give me an architectural overview of ${metadata.fullName}?`)}
              className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-primary-purple bg-primary-purple/10 hover:bg-primary-purple/20 border border-primary-purple/30 transition-colors"
            >
              <Bot className="w-4 h-4 mr-1.5 text-primary-purple" />
              Ask AI Assistant
            </button>
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
            >
              Open on GitHub
              <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
            <button
              onClick={() => setActiveTab('issues')}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary-purple hover:bg-primary-purple/90 transition-all shadow-md shadow-primary-purple/20"
            >
              Find Beginner Issues
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Repository Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-soft-bg border border-slate-200 flex items-center space-x-3">
            <Code2 className="w-5 h-5 text-primary-purple" />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Language</span>
              <span className="text-sm font-bold text-slate-800">{metadata.language || 'Multi-language'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-soft-bg border border-slate-200 flex items-center space-x-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-50" />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Stars</span>
              <span className="text-sm font-bold text-slate-800">{metadata.stars.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-soft-bg border border-slate-200 flex items-center space-x-3">
            <GitFork className="w-5 h-5 text-accent-cyan" />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Forks</span>
              <span className="text-sm font-bold text-slate-800">{metadata.forks.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-soft-bg border border-slate-200 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Open Issues</span>
              <span className="text-sm font-bold text-slate-800">{metadata.openIssuesCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & README', icon: BookOpen },
          { id: 'setup', label: 'Project Setup Guide', icon: Layers },
          { id: 'issues', label: `Beginner Issues (${issues.length})`, icon: Sparkles },
          { id: 'graph', label: 'Code Explorer (Graphify)', icon: Network },
          { id: 'explainer', label: selectedIssue ? `Issue #${selectedIssue.number}` : 'Issue Explainer', icon: HelpCircle, disabled: !selectedIssue },
          { id: 'roadmap', label: 'Contribution Roadmap', icon: ListTodo, disabled: !selectedIssue },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-midnight text-white shadow-sm'
                  : tab.disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-accent-cyan' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & AI Project Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Gemma 4 AI Project Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-6">
            <div className="flex items-center space-x-2 text-primary-purple">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              <h2 className="text-xs font-bold tracking-widest uppercase">Gemma 4 AI Project Summary</h2>
            </div>

            {isExplainingRepo ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary-purple border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-brand-muted">Gemma 4 is analyzing project architecture and README...</p>
              </div>
            ) : explanation ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-midnight mb-2">What does this project do?</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-soft-bg border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-primary-purple" />
                      What Problem Does It Solve?
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {explanation.problemSolved}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-soft-bg border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-accent-cyan" />
                      Who Uses It?
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {explanation.targetAudience}
                    </p>
                  </div>
                </div>

                {/* Main Features */}
                <div>
                  <h4 className="text-sm font-bold text-midnight mb-3">Core Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {explanation.mainFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start text-xs sm:text-sm text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Beginner Onboarding Tips */}
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                  <span className="text-xs font-bold text-primary-purple block uppercase tracking-wider">
                    What Should a Beginner Know Before Contributing?
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {explanation.beginnerTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-accent-cyan font-bold mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No AI explanation loaded.</p>
            )}
          </div>

          {/* Real Repository README Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <FileText className="w-5 h-5 text-primary-purple" />
                <h3 className="font-bold text-base">Repository README</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {metadata.readmeContent ? `${Math.round(metadata.readmeContent.length / 1000)}k characters` : 'No README'}
              </span>
            </div>

            {metadata.readmeContent ? (
              <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-soft-bg border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-text">
                {metadata.readmeContent.slice(0, 15000)}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                This repository does not have a README file on GitHub.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Project Setup Guide */}
      {activeTab === 'setup' && (
        <ProjectSetupGuide
          metadata={metadata}
          onAskAI={(q) => onOpenChat(q)}
        />
      )}

      {/* Tab 3: Beginner Issue Finder */}
      {activeTab === 'issues' && (
        <IssueFinder
          issues={issues}
          isLoading={isLoadingIssues}
          error={issuesError}
          onRetry={onRetryIssues}
          onSelectIssue={handleSelectIssueFromFinder}
          repoMetadata={metadata}
        />
      )}

      {/* Tab 4: Code Explorer (Graphify) */}
      {activeTab === 'graph' && (
        <CodeExplorer
          graphData={graphData}
          isLoading={isLoadingGraph}
          onRetry={onRetryGraph}
          repoFullName={metadata.fullName}
          selectedIssue={selectedIssue}
          onAskAI={(q: string) => onOpenChat(q)}
        />
      )}

      {/* Tab 5: AI Issue Explainer */}
      {activeTab === 'explainer' && selectedIssue && (
        <IssueExplainer
          issue={selectedIssue}
          explanation={issueExplanation}
          isLoading={isLoadingIssueExplanation}
          onExplainAgain={onExplainIssueAgain}
          onNavigateToRoadmap={() => setActiveTab('roadmap')}
          onNavigateToGraph={() => setActiveTab('graph')}
          onAskAI={(q) => onOpenChat(q)}
          repoMetadata={metadata}
        />
      )}

      {/* Tab 6: Contribution Roadmap */}
      {activeTab === 'roadmap' && selectedIssue && (
        <ContributionRoadmap
          roadmap={roadmap}
          isLoading={isLoadingRoadmap}
          issue={selectedIssue}
          repoMetadata={metadata}
          onNavigateToGraph={() => setActiveTab('graph')}
          onRegenerate={onGenerateRoadmap}
        />
      )}
    </div>
  );
};
