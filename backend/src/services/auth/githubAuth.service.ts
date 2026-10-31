import crypto from 'crypto';
import axios from 'axios';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import {
  GitHubUserProfile,
  GitHubAuthorizedRepo,
  GitHubAuthState,
} from '../../types/index.js';

interface StoredSession {
  token: string;
  user: GitHubUserProfile;
  createdAt: number;
}

export class GitHubAuthService {
  // In-memory server-side session store (token NEVER sent to frontend)
  private static sessions = new Map<string, StoredSession>();
  // Active CSRF states
  private static stateStore = new Map<string, number>();

  /**
   * Generates authorization URL with random CSRF state
   */
  public static getAuthorizationUrl(): { url: string; state: string } {
    if (!config.githubAppClientId) {
      throw new Error(
        'GitHub App Client ID is not configured. Please set GITHUB_APP_CLIENT_ID and GITHUB_APP_CLIENT_SECRET in backend .env to enable GitHub Account Connection.'
      );
    }

    const state = crypto.randomBytes(24).toString('hex');
    // State expires in 10 minutes
    this.stateStore.set(state, Date.now() + 10 * 60 * 1000);

    const redirectUri = encodeURIComponent(config.githubAppCallbackUrl);
    // Request minimum read-only permissions: read:user (profile) and repo (metadata/contents/issues)
    const scope = encodeURIComponent('read:user,repo');
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      config.githubAppClientId
    )}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    return { url, state };
  }

  /**
   * Validates state and exchanges code for access token on the backend
   */
  public static async handleCallback(code: string, state: string): Promise<{ sessionId: string; user: GitHubUserProfile }> {
    // 1. Validate CSRF state
    const expiresAt = this.stateStore.get(state);
    if (!expiresAt || Date.now() > expiresAt) {
      this.stateStore.delete(state);
      throw new Error('Invalid or expired GitHub OAuth state token. Please try connecting again.');
    }
    this.stateStore.delete(state);

    if (!config.githubAppClientId || !config.githubAppClientSecret) {
      throw new Error('GitHub App credentials are not fully configured in environment.');
    }

    // 2. Exchange code for access token with GitHub server
    logger.info('Exchanging GitHub authorization code for token');
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.githubAppClientId,
        client_secret: config.githubAppClientSecret,
        code,
        redirect_uri: config.githubAppCallbackUrl,
      },
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'JIMMY-OpenSource-Assistant',
        },
        timeout: 10000,
      }
    );

    const data = tokenRes.data;
    if (data.error || !data.access_token) {
      throw new Error(`GitHub authorization failed: ${data.error_description || data.error || 'No access token received'}`);
    }

    const accessToken = data.access_token;

    // 3. Fetch user profile with the token
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JIMMY-OpenSource-Assistant',
      },
      timeout: 10000,
    });

    const userData = userRes.data;
    const user: GitHubUserProfile = {
      login: userData.login,
      id: userData.id,
      avatarUrl: userData.avatar_url,
      htmlUrl: userData.html_url,
      name: userData.name || undefined,
      email: userData.email || undefined,
      connectedAt: new Date().toISOString(),
    };

    // 4. Generate opaque session ID and store token on server only
    const sessionId = crypto.randomBytes(32).toString('hex');
    this.sessions.set(sessionId, {
      token: accessToken,
      user,
      createdAt: Date.now(),
    });

    logger.info(`GitHub user connected successfully: @${user.login}`);
    return { sessionId, user };
  }

  /**
   * Retrieves user profile for an active session ID
   */
  public static getUser(sessionId: string): GitHubUserProfile | null {
    const session = this.sessions.get(sessionId);
    return session ? session.user : null;
  }

  /**
   * Retrieves authorized repos using the authenticated session token
   */
  public static async getAuthorizedRepos(sessionId: string): Promise<GitHubAuthorizedRepo[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Not connected to GitHub or session has expired.');
    }

    const reposRes = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JIMMY-OpenSource-Assistant',
      },
      params: {
        sort: 'updated',
        per_page: 50,
      },
      timeout: 12000,
    });

    const rawRepos = reposRes.data;
    if (!Array.isArray(rawRepos)) return [];

    return rawRepos.map((r: any) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login || '',
      description: r.description || null,
      isPrivate: Boolean(r.private),
      htmlUrl: r.html_url,
      language: r.language || null,
      updatedAt: r.updated_at,
    }));
  }

  /**
   * Safely disconnects the session on the backend
   */
  public static disconnect(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      logger.info(`Session disconnected: ${sessionId.slice(0, 8)}...`);
    }
  }

  /**
   * Checks if GitHub App credentials are configured
   */
  public static isConfigured(): boolean {
    return Boolean(config.githubAppClientId && config.githubAppClientSecret);
  }
}
