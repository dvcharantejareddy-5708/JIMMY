import React, { useState } from 'react';
import { Compass, Sparkles, GitBranch, ArrowLeft, Github, MessageSquare, Bot } from 'lucide-react';
import { GitHubAuthState } from '../../types';
import { GitHubConnectModal } from '../auth/GitHubConnectModal';

interface HeaderProps {
  onGoHome?: () => void;
  onExploreHowItWorks?: () => void;
  activeRepo?: string | null;
  currentView?: string;
  onSelectView?: (view: string) => void;
  authState?: GitHubAuthState;
  onAuthChange?: (state: GitHubAuthState) => void;
  onOpenChat?: () => void;
  onSelectRepo?: (repoFullName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onExploreHowItWorks,
  activeRepo,
  currentView,
  onSelectView,
  authState = { isConnected: false, user: null, authorizedReposCount: 0 },
  onAuthChange = () => {},
  onOpenChat,
  onSelectRepo,
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={onGoHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-midnight via-deep-navy to-primary-purple flex items-center justify-center text-white shadow-md shadow-primary-purple/20">
              <Compass className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-midnight">JIMMY</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-purple/10 text-primary-purple border border-primary-purple/20">
                  Open Source Assistant
                </span>
              </div>
              <p className="text-[11px] text-brand-muted hidden sm:block">Intelligent Codebase & Contribution Mentor</p>
            </div>
          </div>

          {/* Navigation, GitHub Connect & Chat Context */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-primary-purple hover:bg-primary-purple/10 border border-primary-purple/30 rounded-lg shadow-sm transition-colors"
              title="Open JIMMY AI Assistant"
            >
              <Bot className="w-4 h-4 mr-1.5 text-primary-purple" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* Connect GitHub Button */}
            {authState.isConnected && authState.user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-700"
              >
                <img
                  src={authState.user.avatarUrl}
                  alt={authState.user.login}
                  className="w-5 h-5 rounded-full"
                />
                <span className="font-medium hidden sm:inline">@{authState.user.login}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-midnight bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
              >
                <Github className="w-3.5 h-3.5 mr-1.5" />
                <span>Connect GitHub</span>
              </button>
            )}

            {/* Active Repo or Navigation */}
            {activeRepo ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex items-center px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                  <GitBranch className="w-3.5 h-3.5 mr-1.5 text-primary-purple" />
                  <span className="font-medium truncate max-w-[180px]">{activeRepo}</span>
                </div>
                <button
                  onClick={onGoHome}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-midnight bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Change Repo</span>
                </button>
              </div>
            ) : (
              <nav className="flex items-center space-x-1 sm:space-x-3">
                <button
                  onClick={onGoHome}
                  className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-midnight transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={onExploreHowItWorks}
                  className="hidden md:inline-block px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-midnight transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('repo-input-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-primary-purple hover:bg-primary-purple/90 rounded-lg shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent-cyan" />
                  <span>Explore</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* GitHub Account Connect Modal */}
      <GitHubConnectModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authState={authState}
        onAuthChange={onAuthChange}
        onSelectRepo={onSelectRepo}
      />
    </>
  );
};
