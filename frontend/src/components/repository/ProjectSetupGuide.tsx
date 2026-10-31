import React, { useState, useEffect } from 'react';
import {
  Layers,
  Terminal,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bot,
  ExternalLink,
  Loader2,
  FileCode,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  RepositoryMetadata,
  TechStackDetection,
  InstallationGuide,
  InstallationStep,
} from '../../types';
import { JimmyApi } from '../../services/api';

interface ProjectSetupGuideProps {
  metadata: RepositoryMetadata;
  onAskAI?: (question: string) => void;
}

export const ProjectSetupGuide: React.FC<ProjectSetupGuideProps> = ({
  metadata,
  onAskAI,
}) => {
  const [techStack, setTechStack] = useState<TechStackDetection | null>(null);
  const [guide, setGuide] = useState<InstallationGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedCmdKey, setCopiedCmdKey] = useState<string | null>(null);
  const [copiedFullGuide, setCopiedFullGuide] = useState(false);

  const storageKey = `jimmy_install_guide_${metadata.fullName}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    } catch {}
  }, [completedSteps, storageKey]);

  useEffect(() => {
    loadSetupData();
  }, [metadata.fullName]);

  const loadSetupData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Detect tech stack from real files
      const detectedStack = await JimmyApi.getTechStack(metadata);
      setTechStack(detectedStack);

      // 2. Generate installation guide
      const installGuide = await JimmyApi.getInstallationGuide(metadata, detectedStack);
      setGuide(installGuide);
    } catch (err: any) {
      setError(err.message || 'Failed to load project setup information.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (stepNumber: number) => {
    setCollapsedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const toggleComplete = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleCopyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmdKey(key);
    setTimeout(() => setCopiedCmdKey(null), 2000);
  };

  const handleCopyFullGuide = () => {
    if (!guide) return;
    const text = `=== PROJECT SETUP GUIDE: ${metadata.fullName} ===
Source: ${guide.documentationSource || 'Repository Config Files'}

PREREQUISITES:
${guide.prerequisites.map((p) => `- ${p}`).join('\n')}

INSTALLATION STEPS:
${guide.steps
  .map(
    (s) => `STEP ${s.stepNumber} — ${s.title}
Instructions: ${s.whatToDo}
${s.command ? `Command:\n${s.command}\nExplanation: ${s.commandExplanation || ''}\n` : ''}`
  )
  .join('\n')}

COMMON ERRORS & SOLUTIONS:
${guide.commonErrors.map((e) => `Error: ${e.error}\nFix: ${e.solution}`).join('\n\n')}
`;

    navigator.clipboard.writeText(text);
    setCopiedFullGuide(true);
    setTimeout(() => setCopiedFullGuide(false), 2500);
  };

  const totalSteps = guide?.steps.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 shadow-soft-card">
        <Loader2 className="w-8 h-8 text-primary-purple animate-spin mx-auto" />
        <h4 className="text-base font-bold text-midnight">Analyzing Project Files & Setup Requirements...</h4>
        <p className="text-xs text-brand-muted max-w-md mx-auto">
          Inspecting configuration files (package.json, requirements.txt, Cargo.toml, README) for verified commands.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-3 shadow-soft-card">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">Setup Guide Unavailable</h4>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={loadSetupData}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-purple"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-primary-purple mb-1">
              <Layers className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Verified Project Setup Guide</span>
            </div>
            <h3 className="text-xl font-bold text-midnight">{metadata.fullName}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Derived from real repository configuration files and documentation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyFullGuide}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {copiedFullGuide ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Copied Full Guide!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Guide
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Metric */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Setup Progress</span>
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

      {/* Part 1: Technology Stack Detection */}
      {techStack && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <Layers className="w-5 h-5 text-primary-purple" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Detected Technology Stack</h4>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{techStack.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {techStack.technologies.map((tech, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-midnight">{tech.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary-purple/10 text-primary-purple font-mono font-medium">
                    {tech.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{tech.purpose}</p>
                <div className="pt-1 text-[10px] text-slate-400 flex items-center space-x-1">
                  <FileCode className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Detected from: {tech.detectedFrom}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 2: Step-by-Step Installation Walkthrough */}
      {guide && (
        <div className="space-y-4">
          {/* Prerequisites */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              PREREQUISITES
            </span>
            <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700">
              {guide.prerequisites.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Installation Steps */}
          {guide.steps.map((step) => {
            const isDone = Boolean(completedSteps[step.stepNumber]);
            const isCollapsed = Boolean(collapsedSteps[step.stepNumber]);
            const cmdKey = `cmd-${step.stepNumber}`;

            return (
              <div
                key={step.stepNumber}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDone
                    ? 'bg-slate-50/80 border-emerald-200/60'
                    : 'bg-white border-slate-200 shadow-soft-card'
                }`}
              >
                {/* Step Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => toggleComplete(step.stepNumber)}
                      className="shrink-0 focus:outline-none"
                      title={isDone ? 'Mark as pending' : 'Mark as done'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-primary-purple" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-primary-purple block">
                        STEP {step.stepNumber}
                      </span>
                      <h5
                        className={`text-sm sm:text-base font-bold truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-midnight'
                        }`}
                      >
                        {step.title}
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {onAskAI && step.command && (
                      <button
                        onClick={() =>
                          onAskAI(`Can you explain what this command does and how it works: "${step.command}"?`)
                        }
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium text-primary-purple hover:bg-primary-purple/10 border border-primary-purple/20 transition-colors hidden sm:flex"
                        title="Ask JIMMY AI to explain this command"
                      >
                        <Bot className="w-3.5 h-3.5 mr-1" />
                        Explain Command
                      </button>
                    )}
                    <button
                      onClick={() => toggleCollapse(step.stepNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Step Body */}
                {!isCollapsed && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 text-xs text-slate-700">
                    <p className="leading-relaxed">{step.whatToDo}</p>

                    {step.command && (
                      <div className="space-y-1.5">
                        <div className="p-3 rounded-xl bg-midnight text-accent-cyan font-mono text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2 overflow-x-auto mr-2">
                            <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <pre className="whitespace-pre-wrap">{step.command}</pre>
                          </div>
                          <button
                            onClick={() => handleCopyCmd(step.command!, cmdKey)}
                            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white shrink-0"
                            title="Copy command"
                          >
                            {copiedCmdKey === cmdKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {step.commandExplanation && (
                          <p className="text-[11px] text-slate-500 italic pl-1">
                            {step.commandExplanation}
                          </p>
                        )}
                      </div>
                    )}

                    {step.sourceFile && (
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1">
                        <FileCode className="w-3 h-3 text-slate-400" />
                        <span>Source: {step.sourceFile}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Common Errors */}
          {guide.commonErrors.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-card space-y-3">
              <div className="flex items-center space-x-2 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Common Errors & Fixes</h4>
              </div>
              <div className="space-y-2.5">
                {guide.commonErrors.map((errItem, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1">
                    <p className="font-bold text-amber-900">⚠️ {errItem.error}</p>
                    <p className="text-amber-800 leading-relaxed pl-4">💡 {errItem.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
