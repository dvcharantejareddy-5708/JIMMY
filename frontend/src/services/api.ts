import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  RepositoryMetadata,
  GitHubIssue,
  RepositoryExplanation,
  IssueExplanation,
  BeginnerSuitability,
  ContributionRoadmap,
  GeneratedComment,
  GraphifyResult,
  ChatResponse,
  TechStackDetection,
  InstallationGuide,
  GitHubAuthState,
  GitHubAuthorizedRepo,
  CommentScenario,
  CommentTone,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

function handleApiError(err: unknown, defaultMsg: string): never {
  const axErr = err as AxiosError<ApiResponse<never>>;
  if (axErr.response?.data?.error?.message) {
    throw new Error(axErr.response.data.error.message);
  }
  if (axErr.message) {
    throw new Error(axErr.message);
  }
  throw new Error(defaultMsg);
}

export const JimmyApi = {
  // Health
  checkHealth: async () => {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch (e) {
      handleApiError(e, 'Failed to connect to JIMMY backend.');
    }
  },

  // Repository Metadata
  analyzeRepository: async (url: string): Promise<RepositoryMetadata> => {
    try {
      const res = await api.post<ApiResponse<RepositoryMetadata>>('/repository/analyze', { url });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to analyze repository.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to fetch repository information.');
    }
  },

  getIssues: async (owner: string, repo: string, page = 1, perPage = 30) => {
    try {
      const res = await api.get<ApiResponse<{ issues: GitHubIssue[]; totalCount: number; hasMore: boolean }>>(
        '/repository/issues',
        { params: { owner, repo, page, perPage } }
      );
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to retrieve open issues.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to fetch issues from GitHub.');
    }
  },

  getIssue: async (owner: string, repo: string, number: number): Promise<GitHubIssue> => {
    try {
      const res = await api.get<ApiResponse<GitHubIssue>>('/repository/issue', {
        params: { owner, repo, number },
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || `Failed to retrieve issue #${number}.`);
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to fetch issue details.');
    }
  },

  // Tech Stack & Installation Guide
  getTechStack: async (metadata: RepositoryMetadata): Promise<TechStackDetection> => {
    try {
      const res = await api.post<ApiResponse<TechStackDetection>>('/repository/tech-stack', { metadata });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to analyze tech stack.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to analyze technology stack.');
    }
  },

  getInstallationGuide: async (
    metadata: RepositoryMetadata,
    techStack?: TechStackDetection
  ): Promise<InstallationGuide> => {
    try {
      const res = await api.post<ApiResponse<InstallationGuide>>('/repository/installation-guide', {
        metadata,
        techStack,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate installation guide.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to generate installation guide.');
    }
  },

  // Gemma 4 AI Endpoints
  explainRepository: async (metadata: RepositoryMetadata): Promise<RepositoryExplanation> => {
    try {
      const res = await api.post<ApiResponse<RepositoryExplanation>>('/ai/explain-repository', { metadata });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate project explanation.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Gemma 4 explanation failed.');
    }
  },

  evaluateIssue: async (
    issue: GitHubIssue,
    repoContext: { fullName: string; language: string | null }
  ): Promise<BeginnerSuitability> => {
    try {
      const res = await api.post<ApiResponse<BeginnerSuitability>>('/ai/evaluate-issue', {
        issue,
        repoContext,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to evaluate issue suitability.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to calculate beginner score.');
    }
  },

  explainIssue: async (
    issue: GitHubIssue,
    repoMetadata: RepositoryMetadata,
    options?: { isSimplified?: boolean; verifiedFiles?: string[] }
  ): Promise<IssueExplanation> => {
    try {
      const res = await api.post<ApiResponse<IssueExplanation>>('/ai/explain-issue', {
        issue,
        repoMetadata,
        options,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate issue explanation.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to explain issue.');
    }
  },

  generateContributionPlan: async (
    issue: GitHubIssue,
    repoMetadata: RepositoryMetadata,
    codeRelationshipsHint?: string
  ): Promise<ContributionRoadmap> => {
    try {
      const res = await api.post<ApiResponse<ContributionRoadmap>>('/ai/contribution-plan', {
        issue,
        repoMetadata,
        codeRelationshipsHint,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate contribution roadmap.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to build contribution roadmap.');
    }
  },

  generateComment: async (
    issue: GitHubIssue,
    scenario: CommentScenario = 'express_interest',
    tone: CommentTone = 'Professional',
    userContext?: string
  ): Promise<GeneratedComment> => {
    try {
      const res = await api.post<ApiResponse<GeneratedComment>>('/ai/generate-comment', {
        issue,
        scenario,
        tone,
        userContext,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate comment.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to draft GitHub comment.');
    }
  },

  chat: async (
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: {
      repository?: RepositoryMetadata;
      issue?: GitHubIssue;
      graphSummary?: string;
    }
  ): Promise<ChatResponse> => {
    try {
      const res = await api.post<ApiResponse<ChatResponse>>('/ai/chat', {
        message,
        history,
        context,
      });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to get chat response.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'JIMMY AI Chatbot failed.');
    }
  },

  explainRelationship: async (
    nodeName: string,
    nodeType: string,
    connectedNodes: string[],
    repoName: string,
    issueTitle?: string
  ): Promise<string> => {
    try {
      const res = await api.post<ApiResponse<{ explanation: string }>>('/ai/explain-relationship', {
        nodeName,
        nodeType,
        connectedNodes,
        repoName,
        issueTitle,
      });
      return res.data.data?.explanation || '';
    } catch (e) {
      return '';
    }
  },

  // Graphify
  analyzeGraph: async (url: string): Promise<GraphifyResult> => {
    try {
      const res = await api.post<ApiResponse<GraphifyResult>>('/graph/analyze', { url });
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to extract code relationships.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Graphify relationship analysis failed.');
    }
  },

  getGraphStatus: async () => {
    try {
      const res = await api.get<ApiResponse<{ available: boolean; version?: string; error?: string }>>('/graph/status');
      return res.data.data;
    } catch (e) {
      return { available: false, error: 'Could not contact server.' };
    }
  },

  // GitHub Account Connection
  getAuthUrl: async (): Promise<{ url: string; state: string }> => {
    try {
      const res = await api.get<ApiResponse<{ url: string; state: string }>>('/auth/github/url');
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to generate GitHub authorization link.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'GitHub App connection not available.');
    }
  },

  getAuthStatus: async (): Promise<GitHubAuthState> => {
    try {
      const res = await api.get<ApiResponse<GitHubAuthState>>('/auth/github/status');
      return res.data.data || { isConnected: false, user: null, authorizedReposCount: 0 };
    } catch (e) {
      return { isConnected: false, user: null, authorizedReposCount: 0 };
    }
  },

  getAuthorizedRepos: async (): Promise<GitHubAuthorizedRepo[]> => {
    try {
      const res = await api.get<ApiResponse<GitHubAuthorizedRepo[]>>('/auth/github/repos');
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error?.message || 'Failed to retrieve authorized repositories.');
      }
      return res.data.data;
    } catch (e) {
      handleApiError(e, 'Failed to fetch authorized repositories.');
    }
  },

  disconnectGitHub: async (): Promise<void> => {
    try {
      await api.post('/auth/github/disconnect');
    } catch (e) {
      handleApiError(e, 'Failed to disconnect GitHub account.');
    }
  },
};
