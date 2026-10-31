import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  FileCode2,
  Layers,
  HelpCircle,
  Network,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Loader2,
  Bot,
  Github,
} from 'lucide-react';

interface LandingPageProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'issues' | 'explainer' | 'graph' | 'roadmap'>('overview');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setInputError('Please enter a GitHub repository URL.');
      return;
    }
    if (!trimmed.includes('github.com') && !trimmed.includes('/')) {
      setInputError('Please provide a valid GitHub link, e.g. https://github.com/facebook/react');
      return;
    }
    setInputError(null);
    onAnalyze(trimmed);
  };

  const handleSelectExample = (exampleUrl: string) => {
    setRepoUrl(exampleUrl);
    setInputError(null);
    onAnalyze(exampleUrl);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-soft-bg to-white border-b border-slate-200/60">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-purple/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[250px] bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-purple/10 border border-primary-purple/20 text-primary-purple text-xs sm:text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4 text-accent-cyan" />
            <span>JIMMY — Open Source Assistant</span>
          </div>

          {/* Main Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-midnight tracking-tight leading-[1.15] mb-6">
            Understand Codebases. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-purple to-accent-cyan bg-clip-text text-transparent">
              Contribute with Confidence.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop feeling lost in complicated open-source repositories. JIMMY analyzes public GitHub projects, provides plain-English explanations via Gemma 4, maps AST relationships with Graphify, and generates verified contribution roadmaps.
          </p>

          {/* URL Input Form */}
          <div id="repo-input-section" className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200">
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Paste a public GitHub repository URL..."
                  disabled={isLoading}
                  className="w-full py-2.5 bg-transparent text-sm sm:text-base text-brand-dark placeholder-slate-400 focus:outline-none disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-primary-purple hover:bg-primary-purple/95 shadow-md shadow-primary-purple/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    Analyze Repository
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            {inputError && (
              <p className="text-xs text-rose-600 mt-2 text-left pl-3 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                {inputError}
              </p>
            )}

            {/* Example Repositories */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-brand-muted">
              <span>Try popular examples:</span>
              {[
                { name: 'facebook/react', url: 'https://github.com/facebook/react' },
                { name: 'vitejs/vite', url: 'https://github.com/vitejs/vite' },
                { name: 'expressjs/express', url: 'https://github.com/expressjs/express' },
              ].map((ex) => (
                <button
                  key={ex.name}
                  type="button"
                  onClick={() => handleSelectExample(ex.url)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-primary-purple/50 text-slate-700 hover:text-primary-purple font-mono transition-colors shadow-2xs"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Action */}
          <div className="flex items-center justify-center space-x-4 mb-16">
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-brand-muted hover:text-primary-purple flex items-center transition-colors"
            >
              Explore How It Works
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Interactive Product Preview Card */}
          <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/40 p-4 sm:p-6 text-left overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-4 mb-4 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono text-xs text-slate-500 font-medium">JIMMY Open Source Assistant</span>
              </div>
              {/* Preview Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                {(['overview', 'issues', 'explainer', 'graph', 'roadmap'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePreviewTab(tab)}
                    className={`px-3 py-1 rounded-md capitalize transition-colors ${
                      activePreviewTab === tab
                        ? 'bg-white text-midnight font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-midnight'
                    }`}
                  >
                    {tab === 'graph' ? 'Code Graph' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Preview Content */}
            <div className="min-h-[220px] sm:min-h-[260px] flex flex-col justify-center">
              {activePreviewTab === 'overview' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Gemma 4 Project Summary
                    </span>
                    <span className="text-xs font-mono text-slate-400">TypeScript • 240k Stars</span>
                  </div>
                  <h4 className="text-lg font-bold text-midnight">What does this repository do?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    React is an open-source library for building modern user interfaces out of individual pieces called components. It breaks web apps down into reusable units that manage their own state.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-soft-bg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Target Audience:</span>
                      <span className="text-slate-600">Frontend and full-stack developers crafting interactive web applications.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-soft-bg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-1">Beginner Preparation:</span>
                      <span className="text-slate-600">Ensure solid grasp of JavaScript ES6 syntax, DOM tree concepts, and Git workflow.</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'issues' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-purple">Live Beginner Match</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      Suitability: 92/100
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-midnight">#28410: Fix typo in documentation for hooks API reference</h4>
                  <p className="text-xs text-slate-600">
                    The description clearly points to a broken link and grammar oversight in the documentation markdown file. Excellent first contribution.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">good first issue</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">documentation</span>
                    <span className="text-emerald-600 font-sans font-semibold">Estimated: ~30 mins</span>
                  </div>
                </div>
              )}

              {activePreviewTab === 'explainer' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-xs font-bold text-primary-purple block mb-1">A. UNDERSTAND THE PROBLEM</span>
                    <p className="text-xs text-slate-700">
                      A function returns undefined when an optional options object is omitted by the caller, causing a TypeError downstream in user builds.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100">
                    <span className="text-xs font-bold text-accent-cyan block mb-1">C. WHAT NEEDS TO BE FIXED?</span>
                    <p className="text-xs text-slate-700">
                      Add a default empty object fallback in the parameter destructuring syntax or a null check before accessing properties.
                    </p>
                  </div>
                </div>
              )}

              {activePreviewTab === 'graph' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Graphify AST Relationship Network</span>
                    <span className="text-accent-cyan font-bold">142 Symbols • 218 Edges</span>
                  </div>
                  <div className="h-36 rounded-xl bg-midnight p-4 flex items-center justify-center relative overflow-hidden border border-slate-800">
                    <div className="absolute inset-0 flex items-center justify-around opacity-80">
                      <div className="px-3 py-1.5 rounded-lg bg-deep-navy border border-primary-purple/40 text-accent-cyan text-xs font-mono shadow-glow-cyan">
                        packages/react/src
                      </div>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-accent-cyan to-primary-purple" />
                      <div className="px-3 py-1.5 rounded-lg bg-deep-navy border border-accent-cyan/40 text-white text-xs font-mono shadow-glow-purple">
                        ReactHooks.js
                      </div>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-primary-purple to-accent-cyan" />
                      <div className="px-3 py-1.5 rounded-lg bg-deep-navy border border-emerald-400/40 text-emerald-300 text-xs font-mono">
                        useState()
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-brand-muted text-center">
                    Graphify extracts class, function, and file linkages directly via local AST parsing.
                  </p>
                </div>
              )}

              {activePreviewTab === 'roadmap' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Contribution Roadmap</span>
                    <span className="text-primary-purple font-mono font-bold">2 of 5 Steps Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-purple to-accent-cyan h-full w-2/5 rounded-full" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="line-through text-slate-400">Step 1: Understand problem requirements & reproduction</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="line-through text-slate-400">Step 2: Fork repository and create working branch</span>
                    </div>
                    <div className="flex items-center space-x-2 font-semibold text-primary-purple">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-purple flex items-center justify-center text-[9px]">3</div>
                      <span>Step 3: Modify target file with null-safe fallback</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Strip */}
      <section className="bg-midnight py-6 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-accent-cyan font-mono">100%</span>
              <p className="text-xs text-slate-300 font-medium">Real GitHub Data</p>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">Gemma 4</span>
              <p className="text-xs text-slate-300 font-medium">Vertex AI ADC Reasoning</p>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-primary-purple font-mono">Graphify</span>
              <p className="text-xs text-slate-300 font-medium">AST Code Relationships</p>
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">Zero Auto-Post</span>
              <p className="text-xs text-slate-300 font-medium">You Remain In Full Control</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 bg-soft-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold tracking-widest text-primary-purple uppercase mb-2">The Contributor Dilemma</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-midnight tracking-tight">
              Open Source Should Be Accessible to Everyone.
            </h3>
            <p className="text-sm sm:text-base text-brand-muted mt-3">
              Yet aspiring developers frequently struggle due to complex architectures and implicit maintainer knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft-card card-hover space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-midnight">Complex Codebases</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Thousands of files, undocumented dependencies, and missing architecture diagrams make codebases feel like impenetrable mazes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft-card card-hover space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-midnight">Dense Issue Descriptions</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Issues written for maintainers are often filled with shorthand, jargon, and implicit context that leave newcomers stranded.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft-card card-hover space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-primary-purple flex items-center justify-center">
                <GitPullRequest className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-midnight">Unclear Next Steps</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Hesitation over communication etiquette, commit structures, or test requirements causes contributors to freeze before taking action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Workflow Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold tracking-widest text-accent-cyan uppercase mb-2">Our Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-midnight tracking-tight">
              Calm, Structured Open-Source Mentorship.
            </h3>
            <p className="text-sm sm:text-base text-brand-muted mt-3">
              JIMMY transforms complicated public repositories into an understandable, actionable contribution workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Paste a Repository',
                desc: 'Input any public GitHub repository link. JIMMY validates the URL and fetches live repo data, stars, and README.',
              },
              {
                step: '02',
                title: 'Understand the Architecture',
                desc: 'Gemma 4 AI explains project purpose and setup requirements, while Graphify extracts code symbol relationships.',
              },
              {
                step: '03',
                title: 'Find Beginner Issues',
                desc: 'Explore real open issues ranked by 0–100 Beginner Suitability Scores, difficulty levels, and estimated effort.',
              },
              {
                step: '04',
                title: 'Follow Contribution Roadmaps',
                desc: 'Check off verified step-by-step roadmap milestones, ask JIMMY AI Assistant questions, and explore code architecture with Graphify AST.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-soft-bg border border-slate-200/70 card-hover space-y-3">
                <span className="text-3xl font-black text-primary-purple/30 font-mono block">
                  {item.step}
                </span>
                <h4 className="text-base font-bold text-midnight">{item.title}</h4>
                <p className="text-xs text-brand-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-soft-bg border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold tracking-widest text-primary-purple uppercase mb-2">Feature Suite</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-midnight tracking-tight">
              Intelligent Tools for Open-Source Developers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <Compass className="w-7 h-7 text-primary-purple" />
              <h4 className="font-bold text-midnight">Official GitHub REST API</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Connects directly to GitHub to fetch real open issues, descriptions, labels, and metadata. Pull requests are automatically filtered out.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <Sparkles className="w-7 h-7 text-accent-cyan" />
              <h4 className="font-bold text-midnight">Gemma 4 on Vertex AI ADC</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Powered by Google’s Gemma 4 on Vertex AI via Application Default Credentials (ADC). Zero exposed API keys, zero mock answers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <Network className="w-7 h-7 text-primary-purple" />
              <h4 className="font-bold text-midnight">Graphify Code Intelligence</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Local tree-sitter AST extraction maps function, class, and file linkages directly without third-party token cost.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <Layers className="w-7 h-7 text-accent-cyan" />
              <h4 className="font-bold text-midnight">Project Setup Guide</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Detects tech stack from actual package.json, requirements.txt, or Cargo.toml files and generates verified installation steps.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              <h4 className="font-bold text-midnight">Tailored Contribution Roadmaps</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Interactive step checklists guide you from forking and local testing to branch management, with progress saved locally.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-card space-y-3">
              <Bot className="w-7 h-7 text-primary-purple" />
              <h4 className="font-bold text-midnight">JIMMY AI Assistant</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Contextual chatbot that understands the active repository, selected issue, and Git workflow best practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-midnight via-deep-navy to-midnight text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold">
            JIMMY — Open Source Assistant
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to explore an open-source codebase?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Paste any public GitHub repository URL to understand the architecture, inspect beginner issues, and get started.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('repo-input-section');
                el?.scrollIntoView({ behavior: 'smooth' });
                const inp = el?.querySelector('input');
                inp?.focus();
              }}
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-midnight bg-accent-cyan hover:bg-accent-cyan/90 shadow-lg shadow-accent-cyan/20 transition-all text-sm sm:text-base"
            >
              Start Repository Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
