import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder or root folder
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
  sessionSecret: process.env.SESSION_SECRET || 'jimmy_default_session_secret_change_in_production',

  // Google Cloud Vertex AI / ADC Configuration (Zero API Keys)
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT || '',
  googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  gemmaModel: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',

  // GitHub App / OAuth Configuration
  githubAppId: process.env.GITHUB_APP_ID || '',
  githubAppClientId: process.env.GITHUB_APP_CLIENT_ID || '',
  githubAppClientSecret: process.env.GITHUB_APP_CLIENT_SECRET || '',
  githubAppPrivateKey: process.env.GITHUB_APP_PRIVATE_KEY || '',
  githubAppCallbackUrl: process.env.GITHUB_APP_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  githubToken: process.env.GITHUB_TOKEN || '',

  // Graphify Sandbox Configuration
  graphifySandboxDir: process.env.GRAPHIFY_SANDBOX_DIR || path.resolve(process.cwd(), './temp/sandboxes'),
  graphifyTimeoutMs: parseInt(process.env.GRAPHIFY_TIMEOUT_MS || '60000', 10),
  graphifyMaxRepoMb: parseInt(process.env.GRAPHIFY_MAX_REPO_MB || '50', 10),
};

export function validateEnvironment(): void {
  console.log('--- JIMMY Environment Inspection ---');
  console.log(`Product: JIMMY — Open Source Assistant`);
  console.log(`Port: ${config.port}`);
  console.log(`Node Environment: ${config.nodeEnv}`);
  console.log(`AI Engine: Google Cloud Vertex AI (ADC Mode)`);
  console.log(`Gemma Model: ${config.gemmaModel}`);
  console.log(`Google Cloud Project: ${config.googleCloudProject ? config.googleCloudProject : '(Not configured - Set GOOGLE_CLOUD_PROJECT for ADC)'}`);
  console.log(`Google Cloud Location: ${config.googleCloudLocation}`);
  console.log(`GitHub App Client ID Configured: ${Boolean(config.githubAppClientId)}`);
  console.log('------------------------------------');
}
