// ==========================================
// JIMMY — Core Type Definitions
// ==========================================

export interface RepositoryMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  hasIssues: boolean;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  readmeContent: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  url: string;
  htmlUrl: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  isPullRequest: boolean;
  beginnerSuitability?: BeginnerSuitability;
}

export type DifficultyLevel = 
  | 'Very Easy' 
  | 'Easy' 
  | 'Medium' 
  | 'Hard';

export interface BeginnerSuitability {
  score: number; // 0 to 100
  difficulty: DifficultyLevel;
  estimatedEffort: string;
  reasoning: string;
  requiredKnowledge: string[];
  potentialChallenges: string[];
}

export interface RepositoryExplanation {
  summary: string;
  problemSolved: string;
  targetAudience: string;
  mainFeatures: string[];
  beginnerTips: string[];
  techStackHighlights: string[];
}

// 9 Structured Sections for Issue Explainer
export interface IssueExplanation {
  // A. Understand the Problem
  problemDescription: string;
  // B. Why Does This Matter?
  whyItMatters: string;
  // C. What Needs To Be Fixed?
  whatNeedsToBeFixed: string;
  // D. Technical Terms Explained
  technicalTerms: Array<{
    term: string;
    explanation: string;
  }>;
  // E. Knowledge Required
  knowledgeRequired: string[];
  // F. Possible Difficulty
  possibleDifficulty: DifficultyLevel;
  difficultyReason: string;
  // G. Possible Files To Investigate (from verified repo/Graphify data)
  possibleFilesToInvestigate: string[];
  // H. First Action
  firstAction: string;
  // I. Things To Be Careful About
  thingsToBeCarefulAbout: string[];
  isSimplified?: boolean;
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  whatToDo: string;
  whyItMatters: string;
  expectedOutcome: string;
  relevantFiles?: string[];
  verifiedCommands?: string[];
  isCommandUncertain?: boolean;
  completed?: boolean;
}

export interface ContributionRoadmap {
  issueNumber: number;
  issueTitle: string;
  overview: string;
  steps: RoadmapStep[];
  testingGuidance: string;
  prChecklist: string[];
}

export type CommentScenario = 
  | 'first_time_intro'
  | 'clarification'
  | 'express_interest'
  | 'investigation'
  | 'implementation_expectations'
  | 'sharing_progress';

export type CommentTone = 'Professional' | 'Friendly' | 'Concise';

export interface GeneratedComment {
  comment: string;
  note: string;
  issueUrl: string;
  scenario: CommentScenario;
  tone: CommentTone;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface ChatResponse {
  message: string;
  suggestedPrompts?: string[];
  conversationId: string;
}

// Tech Stack & Installation Types
export interface DetectedTechnology {
  name: string;
  category: string;
  version?: string;
  purpose: string;
  whyNeeded: string;
  detectedFrom: string;
}

export interface TechStackDetection {
  technologies: DetectedTechnology[];
  primaryLanguage: string;
  frameworks: string[];
  packageManager?: string;
  buildTool?: string;
  summary: string;
}

export interface InstallationStep {
  stepNumber: number;
  title: string;
  whatToDo: string;
  command?: string;
  commandExplanation?: string;
  isVerified: boolean;
  sourceFile?: string;
  completed?: boolean;
}

export interface InstallationGuide {
  prerequisites: string[];
  steps: InstallationStep[];
  commonErrors: Array<{
    error: string;
    solution: string;
  }>;
  documentationSource?: string;
}

// GitHub Account & OAuth Types
export interface GitHubUserProfile {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  name?: string;
  email?: string;
  connectedAt: string;
}

export interface GitHubAuthorizedRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  isPrivate: boolean;
  htmlUrl: string;
  language: string | null;
  updatedAt: string;
}

export interface GitHubAuthState {
  isConnected: boolean;
  user: GitHubUserProfile | null;
  authorizedReposCount: number;
}

// Graphify Data Types
export interface GraphNode {
  id: string;
  label: string;
  type: 'file' | 'function' | 'class' | 'module' | 'dependency' | 'community' | 'unknown';
  filePath?: string;
  communityId?: number | string;
  communityName?: string;
  inDegree?: number;
  outDegree?: number;
  relevanceToIssue?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation?: string;
  confidence?: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';
}

export interface GraphifyResult {
  status: 'success' | 'unavailable' | 'empty' | 'error';
  message: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities?: Record<string, string>;
  godNodes?: string[];
  reportMarkdown?: string;
  timestamp: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
