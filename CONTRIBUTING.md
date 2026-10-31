# Contributing to Jimmy.ai

Thank you for your interest in contributing to **Jimmy.ai**! Our mission is to make open-source development approachable and friendly for everyone.

---

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be kind, polite, and constructive in all discussions and pull requests.

---

## Getting Started

1. **Fork the Repository:** Fork Jimmy.ai to your GitHub account.
2. **Clone Locally:**
   ```bash
   git clone https://github.com/<your-username>/jimmy-ai.git
   cd jimmy-ai
   ```
3. **Setup Environment:**
   ```bash
   cp .env.example backend/.env
   ```
   Add your `GEMMA_API_KEY` from Google AI Studio.
4. **Install Dependencies:**
   ```bash
   npm --prefix backend install
   npm --prefix frontend install
   ```
5. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend: `http://localhost:5000`

---

## Coding Standards

* **TypeScript:** Strictly typed; ensure `npm run build` succeeds in both `backend` and `frontend`.
* **Honest Data:** Never fabricate GitHub or AI data. All API models must reflect verified real results.
* **Safety First:** Never execute scripts from target repositories. Jimmy.ai must never post comments or PRs automatically on behalf of users.
* **Styling:** Follow the Jimmy.ai visual design system (Tailwind CSS, Inter & JetBrains Mono fonts, Midnight Navy & Purple palette).

---

## Submitting Changes

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes with clear messages.
3. Push to your fork and submit a Pull Request describing your problem, fix, and testing steps.
