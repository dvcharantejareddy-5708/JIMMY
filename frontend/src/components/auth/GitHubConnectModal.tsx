import React, { useState, useEffect } from 'react';
import {
  Github,
  CheckCircle2,
  Shield,
  ExternalLink,
  LogOut,
  FolderGit2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { JimmyApi } from '../../services/api';
import { GitHubAuthState, GitHubAuthorizedRepo } from '../../types';

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  authState: GitHubAuthState;
  onAuthChange: (state: GitHubAuthState) => void;
  onSelectRepo?: (repoFullName: string) => void;
}

export const GitHubConnectModal: React.FC<GitHubConnectModalProps> = ({
  isOpen,
  onClose,
  authState,
  onAuthChange,
  onSelectRepo,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubAuthorizedRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepos, setShowRepos] = useState(false);

  useEffect(() => {
    if (isOpen && authState.isConnected) {
      loadAuthorizedRepos();
    }
  }, [isOpen, authState.isConnected]);

  const loadAuthorizedRepos = async () => {
    setLoadingRepos(true);
    try {
      const userRepos = await JimmyApi.getAuthorizedRepos();
      setRepos(userRepos);
    } catch (err: any) {
      setError(err.message || 'Could not load authorized repositories.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await JimmyApi.getAuthUrl();
      // Redirect user to official GitHub OAuth authorization page
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate GitHub connection.');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await JimmyApi.disconnectGitHub();
      onAuthChange({ isConnected: false, user: null, authorizedReposCount: 0 });
      setRepos([]);
      setShowRepos(false);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect GitHub account.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-midnight/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transition-all animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-midnight flex items-center justify-center text-white">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-midnight tracking-tight">
                {authState.isConnected ? 'CONNECTED TO GITHUB' : 'CONNECT GITHUB'}
              </h3>
              <p className="text-[11px] text-slate-500">Official GitHub Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authState.isConnected && authState.user ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                <img
                  src={authState.user.avatarUrl}
                  alt={authState.user.login}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate">@{authState.user.login}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Connected
                    </span>
                  </div>
                  <a
                    href={authState.user.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-purple hover:underline inline-flex items-center mt-0.5"
                  >
                    View GitHub Profile <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowRepos(!showRepos)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <FolderGit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  {showRepos ? 'Hide Repositories' : 'Browse Authorized Repos'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <LogOut className="w-3.5 h-3.5 mr-1.5" />}
                  Disconnect
                </button>
              </div>

              {/* Authorized Repos List */}
              {showRepos && (
                <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {loadingRepos ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-purple" />
                      <span>Loading authorized repositories...</span>
                    </div>
                  ) : repos.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No repositories found. Ensure you authorized access in GitHub App settings.
                    </div>
                  ) : (
                    repos.map((repo) => (
                      <div
                        key={repo.id}
                        className="p-3 hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-slate-800 truncate">{repo.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{repo.description || 'No description'}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (onSelectRepo) {
                              onSelectRepo(repo.fullName);
                              onClose();
                            }
                          }}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-white bg-primary-purple hover:bg-primary-purple/90 rounded-lg transition-colors"
                        >
                          Analyze
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Disconnected State */
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your GitHub account to access your repositories and personalize your open-source contribution experience.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Requested Minimum Read-Only Permissions:</span>
                </div>
                <ul className="space-y-1 pl-5 list-disc text-slate-500 text-[11px]">
                  <li>Repository metadata & contents (Read-only)</li>
                  <li>Issues & discussions (Read-only)</li>
                  <li>User profile & email (Read-only)</li>
                </ul>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  JIMMY never requests write access. It cannot create issues, publish comments, or push commits.
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-midnight/90 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connecting to GitHub...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-primary-purple/5 border border-primary-purple/20 text-[11px] text-slate-600 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-purple shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Public repositories can still be analyzed without connecting an account.
                </span>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
            JIMMY uses only the permissions needed for its features. Your GitHub credentials are securely handled by the backend.
          </div>
        </div>
      </div>
    </div>
  );
};
