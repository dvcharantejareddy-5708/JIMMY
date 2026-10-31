import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { JimmyChat } from './components/chat/JimmyChat';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { JimmyApi } from './services/api';
import {
  RepositoryMetadata,
  RepositoryExplanation,
  GitHubIssue,
  IssueExplanation,
  ContributionRoadmap,
  GraphifyResult,
  GitHubAuthState,
} from './types';

export const App: React.FC = () => {
  // Navigation / View State
  const [activeRepoUrl, setActiveRepoUrl] = useState<string | null>(null);

  // Repository Data
  const [repoMetadata, setRepoMetadata] = useState<RepositoryMetadata | null>(null);
  const [repoExplanation, setRepoExplanation] = useState<RepositoryExplanation | null>(null);
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [isExplainingRepo, setIsExplainingRepo] = useState(false);

  // Issues Data
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);

  // Selected Issue Data
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [issueExplanation, setIssueExplanation] = useState<IssueExplanation | null>(null);
  const [isLoadingIssueExplanation, setIsLoadingIssueExplanation] = useState(false);

  // Roadmap Data
  const [roadmap, setRoadmap] = useState<ContributionRoadmap | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);

  // Graphify Data
  const [graphData, setGraphData] = useState<GraphifyResult | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // GitHub Account Connection State
  const [authState, setAuthState] = useState<GitHubAuthState>({
    isConnected: false,
    user: null,
    authorizedReposCount: 0,
  });

  // JIMMY AI Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check GitHub Auth Status on Load & Handle Redirect Query Params
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const state = await JimmyApi.getAuthStatus();
        setAuthState(state);
      } catch {}
    };
    checkAuth();

    // Check URL params from OAuth callback
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('github_connected') === 'true') {
      const user = searchParams.get('user');
      addToast(`Connected to GitHub as @${user || 'user'}!`, 'success');
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuth();
    } else if (searchParams.get('error')) {
      addToast(searchParams.get('error')!, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Main flow: Analyze Repository
  const handleAnalyzeRepository = async (rawUrl: string) => {
    setIsAnalyzingRepo(true);
    setRepoMetadata(null);
    setRepoExplanation(null);
    setIssues([]);
    setSelectedIssue(null);
    setIssueExplanation(null);
    setRoadmap(null);
    setGraphData(null);

    try {
      addToast('Validating URL and fetching repository metadata...', 'info');
      const metadata = await JimmyApi.analyzeRepository(rawUrl);
      setRepoMetadata(metadata);
      setActiveRepoUrl(rawUrl);
      localStorage.setItem('jimmy_last_analyzed_repo', rawUrl);
      addToast(`Connected to ${metadata.fullName}!`, 'success');

      // Fetch Issues in parallel (will auto-select first issue for instant Explainer & Roadmap)
      fetchIssues(metadata.owner, metadata.name, metadata);

      // Trigger Gemma 4 Project Explanation
      fetchRepoExplanation(metadata);

      // Trigger Graphify Analysis in parallel
      fetchGraphData(rawUrl);
    } catch (err: any) {
      addToast(err.message || 'Failed to analyze repository.', 'error');
    } finally {
      setIsAnalyzingRepo(false);
    }
  };

  const fetchRepoExplanation = async (meta: RepositoryMetadata) => {
    setIsExplainingRepo(true);
    try {
      const expl = await JimmyApi.explainRepository(meta);
      setRepoExplanation(expl);
    } catch (err: any) {
      console.warn('Gemma explanation notice:', err.message);
    } finally {
      setIsExplainingRepo(false);
    }
  };

  const fetchIssues = async (owner: string, repo: string, meta?: RepositoryMetadata) => {
    setIsLoadingIssues(true);
    setIssuesError(null);
    try {
      const res = await JimmyApi.getIssues(owner, repo, 1, 30);
      setIssues(res.issues);
      const activeMeta = meta || repoMetadata;
      if (res.issues.length > 0 && activeMeta) {
        handleSelectIssue(res.issues[0], false, activeMeta);
      }
    } catch (err: any) {
      setIssuesError(err.message || 'Could not fetch open issues.');
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const fetchGraphData = async (url: string) => {
    setIsLoadingGraph(true);
    try {
      const res = await JimmyApi.analyzeGraph(url);
      setGraphData(res);
    } catch (err: any) {
      setGraphData({
        status: 'unavailable',
        message: err.message || 'Code relationship analysis is unavailable in this environment.',
        nodes: [],
        edges: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoadingGraph(false);
    }
  };

  // Select Issue Flow
  const handleSelectIssue = async (issue: GitHubIssue, simplified?: boolean, customMeta?: RepositoryMetadata) => {
    const meta = customMeta || repoMetadata;
    setSelectedIssue(issue);
    if (!simplified) {
      setIssueExplanation(null);
      setRoadmap(null);
    }

    if (!meta) return;

    // Fetch Issue Explanation with 9 structured sections
    setIsLoadingIssueExplanation(true);
    try {
      const expl = await JimmyApi.explainIssue(issue, meta, { isSimplified: simplified });
      setIssueExplanation(expl);
    } catch (err: any) {
      addToast(err.message || 'Failed to explain issue with Gemma 4.', 'error');
    } finally {
      setIsLoadingIssueExplanation(false);
    }

    if (!simplified) {
      // Pre-fetch Roadmap in background
      fetchRoadmap(issue, meta);
    }
  };

  const fetchRoadmap = async (issue: GitHubIssue, meta: RepositoryMetadata) => {
    setIsLoadingRoadmap(true);
    try {
      const plan = await JimmyApi.generateContributionPlan(issue, meta);
      setRoadmap(plan);
    } catch (err: any) {
      console.warn('Roadmap generation notice:', err.message);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const handleOpenChat = (prompt?: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleGoHome = () => {
    setActiveRepoUrl(null);
    setRepoMetadata(null);
    setSelectedIssue(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-soft-bg text-brand-dark">
      <Header
        activeRepo={repoMetadata?.fullName}
        onGoHome={handleGoHome}
        authState={authState}
        onAuthChange={setAuthState}
        onOpenChat={() => handleOpenChat()}
        onSelectRepo={(repoFullName) => handleAnalyzeRepository(`https://github.com/${repoFullName}`)}
        onExploreHowItWorks={() => {
          if (repoMetadata) handleGoHome();
          setTimeout(() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      <main className="flex-1">
        {!repoMetadata ? (
          <LandingPage
            onAnalyze={handleAnalyzeRepository}
            isLoading={isAnalyzingRepo}
          />
        ) : (
          <DashboardPage
            metadata={repoMetadata}
            explanation={repoExplanation}
            isExplainingRepo={isExplainingRepo}
            issues={issues}
            isLoadingIssues={isLoadingIssues}
            issuesError={issuesError}
            onRetryIssues={() => fetchIssues(repoMetadata.owner, repoMetadata.name)}
            selectedIssue={selectedIssue}
            onSelectIssue={(issue) => handleSelectIssue(issue, false)}
            issueExplanation={issueExplanation}
            isLoadingIssueExplanation={isLoadingIssueExplanation}
            onExplainIssueAgain={(simplified) =>
              selectedIssue ? handleSelectIssue(selectedIssue, simplified) : Promise.resolve()
            }
            roadmap={roadmap}
            isLoadingRoadmap={isLoadingRoadmap}
            onGenerateRoadmap={() => selectedIssue && repoMetadata && fetchRoadmap(selectedIssue, repoMetadata)}
            graphData={graphData}
            isLoadingGraph={isLoadingGraph}
            onRetryGraph={() => activeRepoUrl && fetchGraphData(activeRepoUrl)}
            onShowToast={addToast}
            onOpenChat={handleOpenChat}
          />
        )}
      </main>

      {/* Floating JIMMY AI Assistant Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => handleOpenChat()}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-midnight hover:bg-midnight/90 text-white shadow-2xl border border-slate-700/80 flex items-center space-x-2.5 transition-all hover:scale-105 group"
          title="Open JIMMY AI Assistant"
        >
          <div className="w-7 h-7 rounded-lg bg-primary-purple flex items-center justify-center text-accent-cyan shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <span className="text-xs font-bold text-white block leading-none">JIMMY AI</span>
            <span className="text-[10px] text-accent-cyan">Open Source Assistant</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan shrink-0 animate-pulse" />
        </button>
      )}

      {/* JIMMY AI Chatbot Assistant Modal/Drawer */}
      <JimmyChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        repository={repoMetadata}
        selectedIssue={selectedIssue}
        initialQuestion={chatInitialPrompt}
      />

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
