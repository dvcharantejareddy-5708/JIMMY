# JIMMY — Cloudways Deployment Guide

This guide details how to deploy **JIMMY — Open Source Assistant** to a managed **Cloudways** server using Node.js, PM2, and Nginx reverse proxy.

---

## 1. Cloudways Server Prerequisites

* **Server Type:** Cloudways Managed Server (DigitalOcean, Vultr, Linode, AWS, or GCP).
* **Application Type:** Custom App (PHP/Node.js stack) or Debian/Ubuntu Cloudways environment with SSH access.
* **Node.js Runtime:** Node.js v20+ or v22+ installed on the server.
* **PM2:** Global process manager (`npm install -g pm2`).
* **Python:** Python 3.10+ with `pip install graphifyy` (for Graphify AST relationship extraction).
* **Google Cloud SDK / ADC:** Google Cloud Workload Identity or service account authentication for Vertex AI (ADC mode — zero API keys).

---

## 2. Server Architecture on Cloudways

JIMMY is architected as a **single unified server**:
1. **Frontend:** React + Vite + TypeScript compiled into static assets in `frontend/dist`.
2. **Backend:** Express + TypeScript server compiled into `backend/dist/server.js`.
3. In production, Express automatically serves the static bundle from `frontend/dist` and handles `/api/...` endpoints on a single internal port (`5000` or assigned `$PORT`).
4. **Nginx Reverse Proxy:** Cloudways Nginx proxies incoming HTTPS traffic (`port 443`) to `http://127.0.0.1:5000`.

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Connect via SSH
Connect to your Cloudways server via SSH using Master Credentials or Application Credentials:
```bash
ssh master_username@your_server_ip
```

### Step 2: Clone Repository
Navigate to your application webroot (`/home/master/applications/<app_name>/public_html/`):
```bash
cd /home/master/applications/<app_name>/public_html
git clone https://github.com/<your-username>/jimmy.git .
```

### Step 3: Configure Environment Variables
Create your production `.env`:
```bash
cp .env.example .env
nano .env
```
Populate your environment variables (placeholders only in examples, never commit secrets):
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-custom-domain.com
APP_BASE_URL=https://your-custom-domain.com

# Google Cloud Vertex AI (Application Default Credentials - Zero API Keys)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GEMMA_MODEL=gemma-4-26b-a4b-it

# GitHub App Integration
GITHUB_APP_CLIENT_ID=your_github_app_client_id
GITHUB_APP_CLIENT_SECRET=your_github_app_client_secret
GITHUB_APP_CALLBACK_URL=https://your-custom-domain.com/api/auth/github/callback

# Session Security
SESSION_SECRET=your_production_random_secret_at_least_32_characters
```

### Step 4: Install Dependencies & Build
Run the unified build command:
```bash
# Install dependencies
npm --prefix backend install
npm --prefix frontend install

# Build production bundles
npm --prefix frontend run build
npm --prefix backend run build
```

### Step 5: Start with PM2
Launch JIMMY with PM2 using the included `ecosystem.config.cjs`:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 6: Configure Cloudways Nginx Reverse Proxy
In your Cloudways Application Settings:
1. Navigate to **Application Settings** -> **SSL Certificate** to install a free Let's Encrypt SSL certificate for HTTPS.
2. In the Nginx vhost or `.htaccess` / proxy configuration, proxy incoming traffic to the internal Node.js port:
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 4. Verification Commands

Verify that the process is healthy:
```bash
pm2 status
curl -s http://127.0.0.1:5000/api/health
```

Expected output:
```json
{
  "status": "healthy",
  "product": "JIMMY",
  "category": "Open Source Assistant",
  "version": "2.0.0"
}
```

---

## 5. Security Checklist on Cloudways

- [x] Application Default Credentials (ADC) used; no plain-text API keys in configuration.
- [x] HTTPS enforced via Let's Encrypt.
- [x] Strict CORS restriction to your production domain.
- [x] Server-side session secrets securely generated.
- [x] Graphify runs in ephemeral sandboxes with automatic directory cleanup.
- [x] GitHub OAuth tokens reside only in server-side session memory.
