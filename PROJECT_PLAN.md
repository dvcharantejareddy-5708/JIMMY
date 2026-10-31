# Jimmy.ai — Ultimate Project Plan

**Product Name:** Jimmy.ai  
**Tagline:** "Your First Open-Source Contribution Starts Here."  
**Supporting Tagline:** "Understand repositories. Discover beginner issues. Contribute with confidence."  
**Category:** AI-Powered Open-Source Contribution Assistant  

---

## 1. Executive Summary & Architecture Overview

Jimmy.ai is a full-stack, hackathon-ready developer application engineered to help first-time open-source contributors navigate public GitHub repositories with confidence. It solves the friction beginners face (unfamiliar code structures, dense technical jargon, intimidating issue descriptions, and unclear contribution etiquette) through an intuitive pipeline:
1. **Repository Intake & Metadata:** Official GitHub REST API extracts real repo statistics, description, languages, and README.
2. **Gemma 4 AI Project Explanation:** Translates project architecture, core purpose, and onboarding expectations into plain English.
3. **Beginner Issue Finder:** Pulls live open issues (filtering out pull requests), calculates an AI-powered Beginner Suitability Score (0–100), estimates effort, and categorizes difficulty without inventing data.
4. **Issue Explainer:** Deconstructs the selected problem into: Problem, Impact, Target Fix, Required Knowledge, and First Action.
5. **Graphify Code Relationship Explorer:** Safely executes local AST analysis via Graphify (`graphify 0.9.97`) to extract dependency networks, class/function relations, and file clusters. Renders interactive SVG/Canvas node graphs.
6. **Contribution Roadmap:** A structured, step-by-step checklist with persisted local progress and verified command suggestions.
7. **Safe GitHub Comment Generator:** Prepares professional, editable comment templates for first-time issue assignment inquiries, ensuring users maintain 100% control over all external actions.

---

## 2. Platform & Technology Constraints

| Component | Technology | Rationale & Configuration |
| :--- | :--- | :--- |
| **Development Agent** | Google Antigravity | Workspace commands, file operations, rules, and workflows |
| **Core AI Model** | Google Gemma 4 (`gemma-4-26b-a4b-it`, `gemma-4-31b-it`) | Official Google Gen AI API (`generativelanguage.googleapis.com`), server-side execution only |
| **Code Relationships** | Graphify (`0.9.97`) | Local Python AST deterministic parsing, zero API leakage, graceful degradation |
| **Hosting Target** | Cloudways | Production Node.js single-port reverse-proxy / PM2 deployment |
| **Backend** | Node.js (v24), Express, TypeScript | REST endpoints, rate limiting, sanitization, CORS, timeout gates |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS | Inter & JetBrains Mono typography, rich visual hierarchy, Lucide icons |
| **Data Integrity** | Official GitHub REST API | Strict public repository validation, no simulated or fabricated data |

---

## 3. Environment Inspection Report

- **Node.js:** `v24.22.1` (Verified)
- **npm:** `11.19.1` (Verified)
- **Python:** `3.14.3` (Verified)
- **Graphify:** `graphify 0.9.97` (Installed & CLI verified)
- **Gemma 4 Provider:** Google Gen AI SDK (`@google/genai` & `@google/generative-ai`), targeting `gemma-4-26b-a4b-it` (MoE) and `gemma-4-31b-it` (Dense). Configurable via `GEMMA_API_KEY` or `GEMINI_API_KEY` in backend `.env`.
- **Cloudways Compatibility:** Single-service Node.js app serving compiled frontend assets from `frontend/dist` on `process.env.PORT || 5000`, orchestrated by PM2 (`ecosystem.config.js`).

---

## 4. Phase-by-Phase Implementation Roadmap

### Phase 1: Working Foundation
- [ ] Initialize repository structure (`backend/` and `frontend/`).
- [ ] Backend foundation: Express + TypeScript server with security headers, CORS, rate limiting, and `/api/health` endpoint.
- [ ] GitHub Service: URL validator and real GitHub REST API integration for repository metadata and README retrieval.
- [ ] Frontend foundation: Vite + React + TypeScript + Tailwind CSS with Jimmy.ai visual design system (Midnight Navy, Deep Navy, Accent Cyan, Primary Purple).
- [ ] Landing page UI with live URL input, feature badges, and error handling.

### Phase 2: Core AI Features (Gemma 4 & Issues)
- [ ] Gemma 4 AI Service: Server-side integration with configurable model (`gemma-4-26b-a4b-it`), prompt engineering, and timeout resilience.
- [ ] Endpoint `/api/ai/explain-repository`: Project summary, problem solved, target audience, and beginner preparation.
- [ ] GitHub Issues Service: Fetch open issues (excluding PRs), paginate, and return real author/label metadata.
- [ ] Endpoint `/api/ai/evaluate-issue`: 0–100 Beginner Suitability Score, difficulty classification, and rationale.
- [ ] Endpoint `/api/ai/explain-issue`: Structured beginner breakdown (Problem, Why It Matters, Target Fix, Required Knowledge, First Action).
- [ ] Frontend Dashboard & Beginner Issue Finder with sorting, filters, and loading skeletons.

### Phase 3: Contribution Features
- [ ] Endpoint `/api/ai/contribution-plan`: Actionable step-by-step roadmap tailored to the issue and repo guidelines.
- [ ] Endpoint `/api/ai/generate-comment`: Professional first-time contributor comment template.
- [ ] Frontend Roadmap View: Interactive checklist with local storage persistence and progress counter.
- [ ] Frontend Comment Generator View: Editable textarea, copy-to-clipboard toast feedback, and direct issue link.

### Phase 4: Graphify Integration & Safe Analysis
- [ ] Safe sandbox repository cloner with depth=1, size caps, timeout controls, and automatic cleanup.
- [ ] Backend Graphify runner: Execute `python -m graphify extract <dir> --code-only` for local AST relationship generation.
- [ ] Graph parser: Read `graphify-out/graph.json` and convert nodes/edges/communities to clean JSON for frontend rendering.
- [ ] Frontend Code Explorer: Interactive node graph with zoom/pan, node selection, symbol search, and relationship details.
- [ ] Graceful fallback: If Graphify is unsupported for a repository or environment, display clear status and preserve all other features.

### Phase 5: Polish, Accessibility & End-to-End Quality
- [ ] Comprehensive responsiveness: Mobile, tablet, and desktop layouts.
- [ ] Accessibility: Semantic HTML, aria labels, keyboard navigation, focus rings.
- [ ] Error boundaries and user-friendly error messages for rate limits, private repos, or missing READMEs.
- [ ] End-to-end testing with public repos (e.g. `facebook/react`, `vitejs/vite`).

### Phase 6: Cloudways Preparation & Documentation
- [ ] Production build setup (TypeScript compilation, Vite build).
- [ ] Unified server script for Cloudways PM2 hosting.
- [ ] Complete documentation: `README.md`, `CLOUDWAYS_DEPLOYMENT.md`, `CONTRIBUTING.md`, `LICENSE`, `.env.example`.
- [ ] Hackathon Demo Mode: 2-3 minute presentation walkthrough.
