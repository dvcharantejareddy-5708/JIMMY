import { Request, Response, NextFunction } from 'express';
import { GitHubAuthService } from '../services/auth/githubAuth.service.js';
import { ApiResponse, GitHubUserProfile, GitHubAuthorizedRepo, GitHubAuthState } from '../types/index.js';

export class AuthController {
  /**
   * GET /api/auth/github/url
   * Generates official GitHub authorization URL
   */
  public static async getAuthUrl(
    req: Request,
    res: Response<ApiResponse<{ url: string; state: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!GitHubAuthService.isConfigured()) {
        res.status(200).json({
          success: false,
          error: {
            code: 'GITHUB_APP_NOT_CONFIGURED',
            message: 'GitHub App integration credentials are not configured in environment. Please configure GITHUB_APP_CLIENT_ID and GITHUB_APP_CLIENT_SECRET in .env.',
          },
        });
        return;
      }

      const authData = GitHubAuthService.getAuthorizationUrl();
      res.status(200).json({
        success: true,
        data: authData,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/github/callback
   * Handles OAuth callback from GitHub, exchanges code for token, and redirects back to frontend
   */
  public static async handleCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const code = String(req.query.code || '');
      const state = String(req.query.state || '');

      if (!code || !state) {
        res.redirect('/?error=' + encodeURIComponent('Missing GitHub OAuth code or state parameter.'));
        return;
      }

      const { sessionId, user } = await GitHubAuthService.handleCallback(code, state);

      // Set HttpOnly, SameSite cookie with opaque sessionId
      res.cookie('jimmy_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect back to application dashboard
      res.redirect(`/?github_connected=true&user=${encodeURIComponent(user.login)}`);
    } catch (err: any) {
      res.redirect('/?error=' + encodeURIComponent(err.message || 'GitHub authentication failed.'));
    }
  }

  /**
   * GET /api/auth/github/status
   * Returns current authentication state and profile without exposing tokens
   */
  public static async getStatus(
    req: Request,
    res: Response<ApiResponse<GitHubAuthState>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check cookie or header for session ID
      const sessionId = req.cookies?.jimmy_session || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        res.status(200).json({
          success: true,
          data: {
            isConnected: false,
            user: null,
            authorizedReposCount: 0,
          },
        });
        return;
      }

      const user = GitHubAuthService.getUser(sessionId);
      if (!user) {
        res.status(200).json({
          success: true,
          data: {
            isConnected: false,
            user: null,
            authorizedReposCount: 0,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          isConnected: true,
          user,
          authorizedReposCount: 0,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/github/repos
   * Returns authorized repositories for the connected user
   */
  public static async getAuthorizedRepos(
    req: Request,
    res: Response<ApiResponse<GitHubAuthorizedRepo[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionId = req.cookies?.jimmy_session || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must connect your GitHub account to view authorized repositories.',
          },
        });
        return;
      }

      const repos = await GitHubAuthService.getAuthorizedRepos(sessionId);
      res.status(200).json({
        success: true,
        data: repos,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/github/disconnect
   * Disconnects GitHub account and clears session
   */
  public static async disconnect(
    req: Request,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionId = req.cookies?.jimmy_session || (req.headers['x-session-id'] as string);
      if (sessionId) {
        GitHubAuthService.disconnect(sessionId);
      }

      res.clearCookie('jimmy_session');
      res.status(200).json({
        success: true,
        data: {
          message: 'GitHub account disconnected successfully.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
