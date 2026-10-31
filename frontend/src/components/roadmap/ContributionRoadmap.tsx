import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Terminal,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckSquare,
  RotateCcw,
  ShieldAlert,
  Copy,
  Check,
  FileCode,
  AlertTriangle,
  Network,
  X,
} from 'lucide-react';
import { ContributionRoadmap as IRoadmap, GitHubIssue, RepositoryMetadata } from '../../types';

interface ContributionRoadmapProps {
  roadmap: IRoadmap | null;
  isLoading: boolean;
  issue: GitHubIssue;
  repoMetadata: RepositoryMetadata;
  onNavigateToGraph?: () => void;
  onRegenerate: () => void;
}

export const ContributionRoadmap: React.FC<ContributionRoadmapProps> = ({
  roadmap,
  isLoading,
  issue,
  repoMetadata,
  onNavigateToGraph,
  onRegenerate,
}) => {
  // Local storage persistence key based on repo and issue number
  const storageKey = `jimmy_roadmap_${repoMetadata.fullName}_${issue.number}`;

  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedRoadmap, setCopiedRoadmap] = useState(false);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    } catch {}
  }, [completedSteps, storageKey]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleResetConfirmed = () => {
    setCompletedSteps({});
    setShowResetConfirm(false);
  };

  const handleCopyRoadmap = () => {
    if (!roadmap) return;
    const text = `=== JIMMY CONTRIBUTION ROADMAP ===
Issue #${issue.number}: ${issue.title}
Repository: ${repoMetadata.fullName}
Overview: ${roadmap.overview}

${roadmap.steps
  .map(
    (s) => `STEP ${s.stepNumber} — ${s.title}
What to do: ${s.whatToDo || (s as any).explanation || ''}
Why it matters: ${s.whyItMatters || ''}
Expected outcome: ${s.expectedOutcome || ''}
${s.relevantFiles && s.relevantFiles.length > 0 ? `Relevant files: ${s.relevantFiles.join(', ')}\n` : ''}${
      s.verifiedCommands && s.verifiedCommands.length > 0 ? `Verified commands: ${s.verifiedCommands.join(' && ')}\n` : ''
    }Status: ${completedSteps[s.stepNumber] ? '[X] Completed' : '[ ] Pending'}`
  )
  .join('\n\n')}

Testing Guidance: ${roadmap.testingGuidance || 'Run repository tests'}
PR Checklist:
${roadmap.prChecklist?.map((item) => `- ${item}`).join('\n') || ''}
`;

    navigator.clipboard.writeText(text);
    setCopiedRoadmap(true);
    setTimeout(() => setCopiedRoadmap(false), 2500);
  };

  const handleCopyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmdIndex(key);
    setTimeout(() => setCopiedCmdIndex(null), 2000);
  };

  const totalSteps = roadmap?.steps.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Roadmap Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-primary-purple mb-1">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Tailored Contribution Roadmap for Issue #{issue.number}</span>
            </div>
            <h3 className="text-xl font-bold text-midnight">{issue.title}</h3>
            {roadmap?.overview && (
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">{roadmap.overview}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyRoadmap}
              disabled={!roadmap}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-40"
              title="Copy complete roadmap"
            >
              {copiedRoadmap ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copiedRoadmap ? 'Copied Roadmap' : 'Copy Roadmap'}
            </button>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3 h-3 inline mr-1" />
              Regenerate
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Reset Progress
            </button>
            {onNavigateToGraph && (
              <button
                onClick={onNavigateToGraph}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-purple hover:bg-primary-purple/90 transition-all shadow-sm"
              >
                <Network className="w-3.5 h-3.5 mr-1.5" />
                Explore Code Architecture
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Metric */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Checklist Completion</span>
            <span className="text-primary-purple font-mono">
              {completedCount} of {totalSteps} steps completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-purple to-accent-cyan h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-midnight/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-midnight">Reset Progress?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to uncheck all completed steps for issue #{issue.number}? This will reset your saved checklist on this device.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirmed}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                Yes, Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-purple border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-midnight">Generating Custom Contribution Roadmap...</p>
        </div>
      ) : roadmap ? (
        <div className="space-y-4">
          {roadmap.steps.map((step) => {
            const isDone = Boolean(completedSteps[step.stepNumber]);
            const commands = step.verifiedCommands || (step as any).suggestedCommand ? [(step as any).suggestedCommand] : [];

            return (
              <div
                key={step.stepNumber}
                className={`rounded-2xl p-5 border transition-all ${
                  isDone
                    ? 'bg-slate-50/80 border-emerald-200/60 shadow-none'
                    : 'bg-white border-slate-200/90 shadow-soft-card hover:border-primary-purple/40'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Toggle Checkbox Button */}
                  <button
                    onClick={() => toggleStep(step.stepNumber)}
                    className="pt-0.5 shrink-0 focus:outline-none"
                    title={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50 hover:text-emerald-600 transition-colors" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-primary-purple transition-colors" />
                    )}
                  </button>

                  {/* Step Content */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-primary-purple">
                          STEP {step.stepNumber}
                        </span>
                        <h4
                          className={`text-base font-bold ${
                            isDone ? 'line-through text-slate-400' : 'text-midnight'
                          }`}
                        >
                          {step.title}
                        </h4>
                      </div>
                      {isDone && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Completed (click to reopen)
                        </span>
                      )}
                    </div>

                    {/* What to do */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {step.whatToDo || (step as any).explanation}
                    </p>

                    {/* Why this step matters */}
                    {step.whyItMatters && (
                      <div className="text-xs text-slate-500 flex items-start space-x-1.5 pt-0.5">
                        <span className="font-semibold text-slate-700 shrink-0">Why this matters:</span>
                        <span>{step.whyItMatters}</span>
                      </div>
                    )}

                    {/* Expected Outcome */}
                    {step.expectedOutcome && (
                      <div className="p-2.5 rounded-lg bg-soft-bg border border-slate-200 text-xs text-slate-700">
                        <span className="font-semibold text-slate-900 block mb-0.5">Expected Outcome:</span>
                        {step.expectedOutcome}
                      </div>
                    )}

                    {/* Relevant Files, if verified */}
                    {step.relevantFiles && step.relevantFiles.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">Relevant Files:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {step.relevantFiles.map((file, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700 flex items-center"
                            >
                              <FileCode className="w-3 h-3 mr-1 text-slate-400" />
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Commands */}
                    {commands.filter(Boolean).length > 0 && (
                      <div className="pt-1 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-600 block">Verified Command:</span>
                        {commands.filter(Boolean).map((cmd, idx) => {
                          const cmdKey = `${step.stepNumber}-${idx}`;
                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-midnight text-accent-cyan font-mono text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2 overflow-x-auto mr-2">
                                <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{cmd}</span>
                              </div>
                              <button
                                onClick={() => handleCopyCommand(cmd, cmdKey)}
                                className="shrink-0 p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Copy command"
                              >
                                {copiedCmdIndex === cmdKey ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                        {step.isCommandUncertain && (
                          <p className="text-[10px] text-amber-600 flex items-center pt-0.5">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Verify this command in the repository instructions before running it.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pull Request Verification Guidance */}
          {roadmap.prChecklist && roadmap.prChecklist.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-midnight">
                <GitPullRequest className="w-5 h-5 text-primary-purple" />
                <h4 className="font-bold text-sm">Pull Request Readiness Checklist</h4>
              </div>
              <ul className="space-y-1.5 pl-7 text-xs text-slate-600">
                {roadmap.prChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <p className="text-sm text-slate-600">No roadmap loaded for this issue yet.</p>
          <button
            onClick={onRegenerate}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-purple hover:bg-primary-purple/90"
          >
            Create Contribution Roadmap
          </button>
        </div>
      )}
    </div>
  );
};
