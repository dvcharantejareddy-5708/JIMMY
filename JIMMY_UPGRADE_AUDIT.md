# JIMMY — Comprehensive Codebase Audit

**Date:** 2026-10-31  
**Product Name:** JIMMY  
**Product Category:** Open Source Assistant  

---

## 1. Executive Summary & Codebase Health

The codebase contains a functional foundational architecture combining React 18, Vite, TypeScript, and Express. However, to meet the strict production and hackathon requirements of **JIMMY — Open Source Assistant**, several critical areas require upgrade, security hardening, and new feature implementation:

1. **Branding Updates:** Legacy branding ("Jimmy.ai", "Your First Open-Source Contribution Starts Here") must be systematically replaced with **JIMMY** and **Open Source Assistant**.
2. **AI Engine & Google Cloud ADC Compliance:** The current AI service relied on API keys. Per enterprise requirements, all API key patterns are being removed in favor of **Google Cloud Vertex AI using Application Default Credentials (ADC)** (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMMA_MODEL`).
3. **GitHub Account Connection (GitHub App / OAuth):** Currently absent. Must be implemented with read-only scopes, CSRF state verification, secure session tokens, and repository selection.
4. **JIMMY AI Assistant (Chatbot):** Currently absent. A full floating/contextual AI chatbot must be added with multi-turn conversation memory, repository context, and issue awareness.
5. **Project Setup Guide (Tech Stack & Installation):** Currently absent. Needs automated detection from `package.json`, `requirements.txt`, `Cargo.toml`, etc., and step-by-step verified installation walkthroughs.
6. **Issue Explainer Structure:** Needs to be upgraded to the 9 mandatory sections (Understand Problem, Why It Matters, What Needs to be Fixed, Technical Terms, Knowledge Required, Possible Difficulty, Possible Files to Investigate, First Action, Things to Be Careful About).
7. **Graphify Reliability & Graph Visualization:** Needs enhanced node layout, interactive neighborhood expansion, and clear limitation reporting.

---

## 2. Working Features

- ✅ **GitHub Public Repository Metadata Retrieval:** `GET /repos/{owner}/{repo}` successfully fetches stars, forks, open issues count, license, and description.
- ✅ **GitHub README Fetcher:** Successfully extracts raw README markdown.
- ✅ **GitHub Open Issues Ingestion:** Fetches open issues, correctly filters out Pull Requests, and maps author and label metadata.
- ✅ **Single-Port Production Serving:** Express backend dynamically serves compiled `frontend/dist` static assets and handles client-side routing on port `5000`.
- ✅ **Graphify AST Extraction Core:** Local Python AST extractor (`graphify 0.9.97`) executes in isolated sandboxes.
- ✅ **Local Storage Progress:** Contribution roadmap persists checked steps across page reloads.

---

## 3. Broken, Incomplete & Inconsistent Features

- ❌ **Legacy Branding Inconsistencies:** Multiple UI components, meta tags, and header/footer templates display "Jimmy.ai" and outdated slogans instead of **JIMMY** and **Open Source Assistant**.
- ❌ **API-Key Dependency in Gemma Service:** Backend previously supported API key fallback. Must strictly use Google Cloud Vertex AI ADC with clean error messaging when ADC is unconfigured.
- ❌ **Issue Explainer Missing Required Sections:** Current explainer lacked dedicated sections for "TECHNICAL TERMS EXPLAINED" and "THINGS TO BE CAREFUL ABOUT".
- ❌ **GitHub Comment Generator Lacked Scenarios & Tone Selection:** Missing the 6 required contribution scenarios and tone options (Professional, Friendly, Concise).
- ❌ **Missing Technology Stack Detection & Setup Guide:** No dedicated `/api/repository/tech-stack` or `/api/repository/installation-guide` endpoints.
- ❌ **Missing AI Chatbot:** No `/api/ai/chat` endpoint or floating/in-page chatbot component.
- ❌ **Missing GitHub App Connection:** No OAuth / GitHub App authorization, user profile storage, or authorized repository browser.

---

## 4. API & Integration Connection Status

| Service | Connection Status | Required Upgrade Action |
| :--- | :--- | :--- |
| **Google Cloud Gemma 4** | Configured for Vertex AI ADC | Transition to `@google/genai` Vertex AI mode using ADC (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`). Zero API keys allowed. |
| **GitHub App / OAuth** | Missing | Implement `GET /api/auth/github`, `GET /api/auth/github/callback`, `GET /api/auth/github/user`, and `POST /api/auth/github/disconnect`. |
| **GitHub REST API** | Active (Public) | Augment with repository contents and config file inspection (`package.json`, `Cargo.toml`, etc.). |
| **Graphify AST Engine** | Active (`0.9.97`) | Improve graph node filtering, relationship inspector, and syntax error handling. |
| **Cloudways Hosting** | Single-Port PM2 Ready | Review ADC production runtime options and document Workload Identity / environment configuration. |

---

## 5. Security & Credential Audit

- 🔒 **Zero Hardcoded Secrets:** All temporary API keys have been scrubbed from `.env` and `backend/.env`.
- 🔒 **Strict `.gitignore`:** Excludes `.env*`, `*.pem`, `*.key`, `service-account*.json`, `credentials*.json`, and `*adc*.json`.
- 🔒 **No Untrusted Script Execution:** Repository scripts (`npm install`, setup scripts) are strictly prohibited from execution.
- 🔒 **Server-Side Credential Isolation:** GitHub tokens and Vertex AI ADC tokens are never stored in browser storage (`localStorage` / `sessionStorage`).
- 🔒 **SSRF & Command Injection Guards:** GitHub URLs are sanitized with strict regular expressions; `git clone` uses parameterized arrays rather than shell interpolation.

---

## 6. Required Improvements Checklist

1. [ ] Apply **JIMMY — Open Source Assistant** branding globally.
2. [ ] Implement Google Cloud Vertex AI ADC integration for Gemma 4.
3. [ ] Build **Connect GitHub** feature (OAuth/GitHub App read-only permissions).
4. [ ] Implement **JIMMY AI Assistant** (Chatbot with repository and issue context).
5. [ ] Upgrade **Issue Explainer** with all 9 comprehensive sections and copy/re-explain actions.
6. [ ] Upgrade **Contribution Roadmap** with dynamic issue-specific generation, copy, and reset.
7. [ ] Upgrade **Comment Generator** with 6 scenarios and 3 tone settings.
8. [ ] Build **Project Setup Guide** with tech stack detection and step-by-step instructions.
9. [ ] Polish **Graphify Code Explorer** with interactive SVG/Canvas visualization and neighborhood inspection.
10. [ ] Update documentation and Cloudways deployment guidelines.
