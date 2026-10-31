import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Tag,
  User,
  ChevronDown,
} from 'lucide-react';
import { GitHubIssue, BeginnerSuitability, RepositoryMetadata } from '../../types';
import { CardSkeleton } from '../common/Skeleton';

interface IssueFinderProps {
  issues: GitHubIssue[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectIssue: (issue: GitHubIssue) => void;
  repoMetadata: RepositoryMetadata;
}

export const IssueFinder: React.FC<IssueFinderProps> = ({
  issues,
  isLoading,
  error,
  onRetry,
  onSelectIssue,
  repoMetadata,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'beginner' | 'good-first-issue' | 'help-wanted' | 'docs' | 'bugs'>('all');
  const [selectedSort, setSelectedSort] = useState<'beginner' | 'recent' | 'effort'>('beginner');

  // Compute beginner suitability estimate if not yet cached on the issue
  // Uses deterministic heuristic based on labels, length, and title to provide an immediate score
  const issuesWithScores = useMemo(() => {
    return issues.map((issue) => {
      if (issue.beginnerSuitability) {
        return issue;
      }

      // Generate a transparent heuristic estimate prior to deep Gemma invocation
      let score = 50;
      const lowerTitle = issue.title.toLowerCase();
      const lowerBody = (issue.body || '').toLowerCase();
      const labelNames = issue.labels.map((l) => l.name.toLowerCase());

      const hasGoodFirst = labelNames.some((l) => l.includes('good first') || l.includes('beginner') || l.includes('starter'));
      const hasHelpWanted = labelNames.some((l) => l.includes('help wanted'));
      const isDoc = labelNames.some((l) => l.includes('doc')) || lowerTitle.includes('docs') || lowerTitle.includes('readme') || lowerTitle.includes('typo');
      const isBug = labelNames.some((l) => l.includes('bug')) || lowerTitle.includes('fix');

      if (hasGoodFirst) score += 30;
      if (isDoc) score += 20;
      if (hasHelpWanted) score += 10;
      if (isBug) score += 5;

      // Penalize very long or extremely dense descriptions that indicate deep architectural refactors
      if (lowerBody.length > 3000) score -= 15;
      if (lowerTitle.includes('refactor') || lowerTitle.includes('performance') || lowerTitle.includes('memory')) score -= 20;

      // Clamp between 15 and 98
      score = Math.max(15, Math.min(98, score));

      let difficulty: BeginnerSuitability['difficulty'] = 'Medium';
      if (score >= 80) difficulty = 'Very Easy';
      else if (score >= 65) difficulty = 'Easy';
      else if (score < 40) difficulty = 'Hard';

      let estimatedEffort = '2-4 hours';
      if (difficulty === 'Very Easy') estimatedEffort = '30-60 mins';
      else if (difficulty === 'Easy') estimatedEffort = '1-2 hours';
      else if (difficulty === 'Hard') estimatedEffort = '4+ hours';

      const syntheticSuitability: BeginnerSuitability = {
        score,
        difficulty,
        estimatedEffort,
        reasoning: hasGoodFirst
          ? 'Maintainer marked this with beginner labels. Well-scoped task.'
          : isDoc
          ? 'Documentation improvement with clear scope and low code risk.'
          : 'Standard issue requiring codebase inspection and targeted fix.',
        requiredKnowledge: [repoMetadata.language || 'Basic Programming', 'Git Workflow'],
        potentialChallenges: ['Reviewing related tests before PR'],
      };

      return {
        ...issue,
        beginnerSuitability: syntheticSuitability,
      };
    });
  }, [issues, repoMetadata.language]);

  // Filtering
  const filteredIssues = useMemo(() => {
    return issuesWithScores.filter((issue) => {
      // Search
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(issue.number).includes(searchQuery.trim()) ||
        (issue.body && issue.body.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category Filters
      const labelNames = issue.labels.map((l) => l.name.toLowerCase());
      if (selectedFilter === 'beginner') {
        return (issue.beginnerSuitability?.score ?? 0) >= 60;
      }
      if (selectedFilter === 'good-first-issue') {
        return labelNames.some((l) => l.includes('good first') || l.includes('beginner'));
      }
      if (selectedFilter === 'help-wanted') {
        return labelNames.some((l) => l.includes('help wanted'));
      }
      if (selectedFilter === 'docs') {
        return labelNames.some((l) => l.includes('doc')) || issue.title.toLowerCase().includes('doc');
      }
      if (selectedFilter === 'bugs') {
        return labelNames.some((l) => l.includes('bug')) || issue.title.toLowerCase().includes('fix');
      }
      return true;
    });
  }, [issuesWithScores, searchQuery, selectedFilter]);

  // Sorting
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      if (selectedSort === 'beginner') {
        return (b.beginnerSuitability?.score ?? 0) - (a.beginnerSuitability?.score ?? 0);
      }
      if (selectedSort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (selectedSort === 'effort') {
        const scoreA = a.beginnerSuitability?.score ?? 0;
        const scoreB = b.beginnerSuitability?.score ?? 0;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [filteredIssues, selectedSort]);

  const difficultyColors: Record<string, string> = {
    'Very Easy': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Easy': 'bg-blue-100 text-blue-800 border-blue-300',
    'Medium': 'bg-amber-100 text-amber-800 border-amber-300',
    'Hard': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-midnight">Beginner Issue Finder</h3>
            <p className="text-xs text-brand-muted">
              Displaying real open issues from <span className="font-mono font-medium text-slate-700">{repoMetadata.fullName}</span> (excluding pull requests).
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {sortedIssues.length} of {issues.length} Issues Shown
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search bar */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues by title, number (#123), or keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-soft-bg border border-slate-200 rounded-xl focus:outline-none focus:border-primary-purple transition-colors"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-soft-bg border border-slate-200 rounded-xl appearance-none focus:outline-none focus:border-primary-purple text-slate-700 font-medium"
            >
              <option value="beginner">Sort: Most Beginner-Friendly</option>
              <option value="recent">Sort: Recently Created</option>
              <option value="effort">Sort: Lowest Estimated Effort</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 text-xs">
          {[
            { id: 'all', label: 'All Open Issues' },
            { id: 'beginner', label: '⭐ Beginner Friendly' },
            { id: 'good-first-issue', label: 'Good First Issue' },
            { id: 'help-wanted', label: 'Help Wanted' },
            { id: 'docs', label: 'Documentation' },
            { id: 'bugs', label: 'Bugs' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedFilter === f.id
                  ? 'bg-primary-purple text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">Unable to Fetch Issues</h4>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-midnight hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Retry Fetching Issues
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedIssues.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Issues Match Your Filters</h4>
          <p className="text-xs text-brand-muted max-w-md mx-auto">
            {issues.length === 0
              ? 'This repository currently has zero open issues on GitHub.'
              : 'Try selecting "All Open Issues" or clearing your search keywords.'}
          </p>
          {issues.length > 0 && (
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-primary-purple hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Issues Grid */}
      {!isLoading && !error && sortedIssues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedIssues.map((issue) => {
            const suitability = issue.beginnerSuitability!;
            return (
              <div
                key={issue.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft-card card-hover flex flex-col justify-between space-y-4"
              >
                {/* Header: Number, Date, Author */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-bold text-primary-purple">#{issue.number}</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        @{issue.author.login}
                      </span>
                      <span>•</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-midnight leading-snug line-clamp-2">
                    {issue.title}
                  </h4>

                  {/* Short Description */}
                  <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed">
                    {issue.body ? issue.body.replace(/[#*`_]/g, '') : 'No description provided by issue author.'}
                  </p>
                </div>

                {/* Score & Difficulty Badge Strip */}
                <div className="p-3 rounded-xl bg-soft-bg border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-accent-cyan" />
                      <span className="text-xs font-semibold text-slate-800">Beginner Suitability:</span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-midnight px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                      {suitability.score} / 100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${difficultyColors[suitability.difficulty]}`}>
                      {suitability.difficulty}
                    </span>
                    <span className="text-slate-600 font-mono text-[11px] flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      ~{suitability.estimatedEffort}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic leading-normal">
                    "{suitability.reasoning}"
                  </p>
                </div>

                {/* Labels */}
                {issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {issue.labels.slice(0, 4).map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700"
                      >
                        <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                        {label.name}
                      </span>
                    ))}
                    {issue.labels.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-mono self-center">
                        +{issue.labels.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={issue.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-brand-muted hover:text-midnight font-medium transition-colors"
                  >
                    Open on GitHub
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>

                  <button
                    onClick={() => onSelectIssue(issue)}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-purple hover:bg-primary-purple/90 shadow-sm transition-all"
                  >
                    Understand This Issue
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
