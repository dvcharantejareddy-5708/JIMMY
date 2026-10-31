# JIMMY — Upgrade Implementation Plan

**Product:** JIMMY  
**Category:** Open Source Assistant  

---

## Phase Breakdown

### Phase 1: Global Branding Refactor & Security Baseline
- Update all instances of "Jimmy.ai" to **JIMMY**.
- Update tagline to **Open Source Assistant**.
- Update meta tags, page titles, headers, footers, logos, and UI labels.
- Verify zero committed secrets or plain-text credentials in repository.

### Phase 2: Gemma 4 via Google Cloud Vertex AI (ADC)
- Configure `@google/genai` in Vertex AI mode using Application Default Credentials (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMMA_MODEL`).
- Remove any API-key authentication logic or fallbacks.
- Implement explicit, helpful error handling when ADC is not logged in or project is unset.
- Add response validation, prompt injection defenses, and strict system instructions.

### Phase 3: Issue Explainer & Contribution Roadmap Enhancement
- Upgrade Issue Explainer to include all 9 required sections:
  1. Understand the Problem
  2. Why Does This Matter?
  3. What Needs to be Fixed?
  4. Technical Terms Explained
  5. Knowledge Required
  6. Possible Difficulty (Very Easy, Easy, Medium, Hard)
  7. Possible Files to Investigate
  8. First Action
  9. Things to Be Careful About
- Add interactive actions: "Explain more simply", "Regenerate", "Copy explanation", "Open on GitHub", "Ask AI".
- Upgrade Contribution Roadmap with issue-specific steps, verified commands, copy roadmap, and reset confirmation.

### Phase 4: GitHub Comment Generator Upgrade
- Implement 6 distinct contribution scenarios:
  1. First-time contributor introduction
  2. Asking for clarification
  3. Expressing interest in working on an issue
  4. Explaining an initial investigation
  5. Asking about implementation expectations
  6. Sharing progress
- Implement tone selector: Professional, Friendly, Concise.
- Ensure editable textarea, copy button with feedback toast, and safety disclaimers.

### Phase 5: JIMMY AI Assistant (Chatbot)
- Create backend endpoint `POST /api/ai/chat` supporting multi-turn conversation and context management.
- Provide general open-source guidance, repository-aware insights, and issue-specific troubleshooting.
- Build floating widget, dedicated full-page view, and contextual panel in repository/issue tabs.
- Support suggested prompts, copy message, clear history, and responsive layout.

### Phase 6: Project Setup Guide & Technology Stack Detection
- Create backend endpoint `POST /api/repository/tech-stack` to inspect real repository config files (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, etc.).
- Create backend endpoint `POST /api/repository/installation-guide` to generate step-by-step setup guides (Prerequisites, Tools, Clone, Dependencies, Environment, Startup, Verification, Common Errors).
- Build Project Setup Guide UI with step expansion, command copying, and completion tracking.

### Phase 7: Connect GitHub Feature (GitHub App / OAuth)
- Implement backend OAuth endpoints:
  - `GET /api/auth/github`: Initiates authorization with random CSRF state.
  - `GET /api/auth/github/callback`: Exchanges authorization code securely for session token.
  - `GET /api/auth/github/user`: Returns connected account profile (read-only).
  - `POST /api/auth/github/disconnect`: Invalidates session and clears connection.
  - `GET /api/auth/github/repos`: Lists authorized repositories for the connected user.
- Build frontend "Connect GitHub" UI in Header and dedicated Account/Settings modal.
- Retain unauthenticated public repository analysis when disconnected.

### Phase 8: Graphify Code Explorer Clarity & Reliability
- Enhance node positioning and graph density controls to prevent visual clutter.
- Provide node filters (Files, Functions, Classes, Modules) and symbol search.
- Highlight connected dependencies and show contextual relevance to selected issues.
- Provide informative empty/error states and gracefully handle unsupported repository languages.

### Phase 9: Unified Navigation & End-to-End Testing
- Ensure repository and issue context seamlessly persists across all features (Chatbot, Explainer, Roadmap, Graphify, Setup Guide).
- Test all buttons, copy actions, checkboxes, and filters.
- Run full production build and smoke tests.

### Phase 10: Documentation & Cloudways Deployment Review
- Update `README.md`, `CLOUDWAYS_DEPLOYMENT.md`, `CONTRIBUTING.md`, and `BUILD_PROGRESS.md`.
- Document Workload Identity Federation / ADC execution on Cloudways.
