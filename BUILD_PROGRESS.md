# JIMMY — Build Progress & Upgrade Tracker

**Product Name:** JIMMY  
**Product Category:** Open Source Assistant  
**AI Engine:** Google Cloud Vertex AI ADC (`gemma-4-26b-a4b-it`) — Zero API Keys  
**Code Intelligence:** Graphify AST Extraction Engine (`graphify 0.9.97`)  
**Deployment Target:** Cloudways Node.js / PM2 Runtime  
**Build Status:** Both Frontend (`tsc && vite build`) and Backend (`tsc`) Pass Cleanly (Code 0)  

---

## Upgrade Verification Checklist

### Phase 1: Codebase Audit, Security Hardening & Zero API Keys
- [x] Complete security audit performed and documented in `JIMMY_UPGRADE_AUDIT.md`.
- [x] All raw API keys scrubbed from code, config, and `.env` files.
- [x] Zero API keys in frontend build or source files.
- [x] Configured Google Cloud Vertex AI mode via Application Default Credentials (ADC).
- [x] Hardened `.gitignore` to prevent committing secrets, `.env*`, `*.pem`, `*.key`, `service-account*.json`, and ADC files.
- [x] Verified zero secret matches across repository files.

### Phase 2: Issue Explainer (Fully Functional — 9 Sections)
- [x] Fetches real GitHub issues excluding pull requests.
- [x] Implements all 9 structured sections (A to I):
  - A. Understand the Problem
  - B. Why Does This Matter?
  - C. What Needs To Be Fixed?
  - D. Technical Terms Explained
  - E. Knowledge Required
  - F. Possible Difficulty (Very Easy, Easy, Medium, Hard) & Reason
  - G. Possible Files to Investigate (from verified Graphify/repo data)
  - H. First Action
  - I. Things to Be Careful About
- [x] "Explain More Simply" option for beginners.
- [x] "Copy Explanation" with formatted markdown and copy toast.
- [x] "Ask AI About This" opens JIMMY AI Assistant with issue context.
- [x] "Open on GitHub" link opens the real issue in a new tab.

### Phase 3: Contribution Roadmap (Actionable & Issue-Specific)
- [x] Generates issue-specific steps with what to do, why it matters, expected outcome, verified files, and verified commands.
- [x] Interactive step completion checkboxes with instant progress calculation.
- [x] Local storage persistence keyed by repository and issue number.
- [x] Reopen completed steps capability.
- [x] Reset progress action with confirmation modal.
- [x] Copy complete roadmap functionality with confirmation feedback.
- [x] Regenerate roadmap button.

### Phase 4: GitHub Comment Generator (6 Scenarios & 3 Tones)
- [x] Implements 6 contributor scenarios:
  1. Express Interest
  2. First-Time Contributor Introduction
  3. Asking for Clarification
  4. Initial Investigation
  5. Implementation Design Expectations
  6. Progress Update
- [x] Implements 3 tone selectors: Professional, Friendly, Concise.
- [x] Editable comment textarea with character counter.
- [x] One-click copy with toast notification.
- [x] Direct link to original GitHub issue.
- [x] Clear/reset button.
- [x] User-controlled safety guarantee: JIMMY never automatically posts comments.

### Phase 5: JIMMY AI Assistant (Contextual Chatbot)
- [x] Connected to Google Gemma 4 on Vertex AI via Application Default Credentials (ADC).
- [x] Accessible from floating bottom-right launcher, header button, and contextual panels.
- [x] Understands active repository metadata, README excerpt, and selected issue.
- [x] Multi-turn conversation history management.
- [x] Suggested prompt chips based on active context.
- [x] Copy assistant response and clear conversation buttons.
- [x] Truthful configuration status when ADC is unconfigured (no fake responses).

### Phase 6: Graphify Code Explorer (Real AST Analysis)
- [x] Safe shallow cloning into isolated ephemeral sandbox (`depth=1`, size caps).
- [x] AST symbol extraction using local Graphify python runner (`--code-only`).
- [x] Automatic sandbox cleanup in `finally` blocks.
- [x] Interactive SVG graph layout with zoom in, zoom out, pan, and reset.
- [x] Symbol search and entity type filtering (Files, Functions, Classes, Modules).
- [x] Connected node highlighting and node inspector details panel.
- [x] Graceful fallback when Graphify is unavailable in environment.

### Phase 7: Project Setup Guide (Tech Stack & Installation Walkthrough)
- [x] Deterministic detection from real repository configuration files:
  - `package.json` (Node.js, React, Next.js, Express, TypeScript, Vite, Jest, Vitest)
  - `requirements.txt` & `pyproject.toml` (Python, FastAPI, Django, Flask, pytest)
  - `Cargo.toml` (Rust & Cargo)
  - `go.mod` (Go Modules)
  - `Dockerfile` & `docker-compose.yml` (Docker & Containerization)
- [x] Step-by-step verified installation walkthrough (Clone, Branch, Dependencies, Env, Start, Test).
- [x] Expand/collapse steps and step completion tracking with progress bar.
- [x] One-click command copy buttons.
- [x] Common installation errors & solutions guide.
- [x] "Explain Command" integration with JIMMY AI Assistant.

### Phase 8: Connect GitHub Feature (OAuth Flow)
- [x] Official GitHub OAuth authorization flow using random CSRF state validation.
- [x] Server-side code exchange and token management (tokens never stored in frontend or localStorage).
- [x] Requests minimum read-only permissions (`read:user,repo`).
- [x] Displays connected user profile: login, avatar, profile link, connection status badge.
- [x] Authorized repository browser and selection.
- [x] Safe disconnection endpoint clearing session.
- [x] Public repository analysis remains 100% accessible anonymously without connection.

### Phase 9: Global Branding & UI Polish
- [x] Application name is strictly **JIMMY**.
- [x] Product category is strictly **Open Source Assistant**.
- [x] Removed all legacy branding (`Jimmy.ai`, `Your First Open-Source Contribution Starts Here`).
- [x] Consistent color palette: Midnight Navy (`#111B35`), Purple (`#7047EB`), Cyan (`#20B8D5`), Soft BG (`#F6F7FB`).
- [x] Browser title and meta tags updated in `index.html`.
- [x] Header, Footer, Landing Page, Dashboard, and Chat UI reflect unified identity.

### Phase 10: Production Build & Cloudways Compatibility
- [x] Frontend production bundle built with Vite (`frontend/dist`).
- [x] Backend TypeScript compiled with `tsc` (`backend/dist`).
- [x] Express serves both API routes and static frontend on single port (port 5000).
- [x] Cloudways PM2 runtime configuration (`ecosystem.config.cjs`).
- [x] End-to-end browser subagent verification completed with zero regressions.
