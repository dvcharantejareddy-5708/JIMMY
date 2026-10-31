import React from 'react';
import { Compass, ShieldCheck, Cpu, GitFork } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-midnight text-slate-300 border-t border-slate-800/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary-purple flex items-center justify-center text-white">
                <Compass className="w-4 h-4 text-accent-cyan" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">JIMMY</span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary-purple/30 text-accent-cyan border border-primary-purple/40">
                Open Source Assistant
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              JIMMY is an intelligent, developer-friendly Open Source Assistant. Understand repositories, explore architecture with Graphify, evaluate issues with Gemma 4, and contribute with confidence.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>User-Controlled: JIMMY never publishes comments or PRs automatically.</span>
            </div>
          </div>

          {/* Technology Stack */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Core Stack</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Google Gemma 4 on Vertex AI (ADC)</span>
              </li>
              <li className="flex items-center space-x-2">
                <GitFork className="w-3.5 h-3.5 text-primary-purple" />
                <span>Graphify AST Code Analysis</span>
              </li>
              <li>Official GitHub REST API</li>
              <li>React + TypeScript + Tailwind</li>
            </ul>
          </div>

          {/* Responsible AI & Deployment */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Security & Deployment</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Zero API Keys (Application Default Credentials)</li>
              <li>Cloudways Node.js / PM2 Runtime</li>
              <li>Ephemeral Sandboxed Processing</li>
              <li>Strict Minimum Read-Only Permissions</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JIMMY — Open Source Assistant. Built with Google Gemma 4 & Graphify.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">MIT Licensed • Safe & Deterministic Code Intelligence</p>
        </div>
      </div>
    </footer>
  );
};
