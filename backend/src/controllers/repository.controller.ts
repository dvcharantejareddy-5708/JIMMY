import { Request, Response, NextFunction } from 'express';
import { validateAndParseGitHubUrl } from '../services/github/urlValidator.js';
import { GitHubService } from '../services/github/github.service.js';
import { TechStackService } from '../services/repository/techStack.service.js';
import {
  ApiResponse,
  RepositoryMetadata,
  GitHubIssue,
  TechStackDetection,
  InstallationGuide,
} from '../types/index.js';

export class RepositoryController {
  /**
   * POST /api/repository/analyze
   * Takes a public GitHub URL and returns validated metadata and README.
   */
  public static async analyze(
    req: Request,
    res: Response<ApiResponse<RepositoryMetadata>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { url } = req.body;
      const parsed = validateAndParseGitHubUrl(url);

      if (!parsed.isValid || !parsed.owner || !parsed.repo) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_GITHUB_URL',
            message: parsed.error || 'Please provide a valid public GitHub repository URL.',
          },
        });
        return;
      }

      const metadata = await GitHubService.getRepository(parsed.owner, parsed.repo);

      res.status(200).json({
        success: true,
        data: metadata,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/repository/issues
   * Returns real open issues for a repository (excluding PRs).
   */
  public static async getIssues(
    req: Request,
    res: Response<ApiResponse<{ issues: GitHubIssue[]; totalCount: number; hasMore: boolean }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const owner = String(req.query.owner || '');
      const repo = String(req.query.repo || '');
      const page = parseInt(String(req.query.page || '1'), 10);
      const perPage = parseInt(String(req.query.perPage || '30'), 10);

      if (!owner || !repo) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: 'Both "owner" and "repo" query parameters are required.',
          },
        });
        return;
      }

      const result = await GitHubService.getOpenIssues(owner, repo, page, perPage);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/repository/issue
   * Returns a specific issue by number.
   */
  public static async getIssue(
    req: Request,
    res: Response<ApiResponse<GitHubIssue>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const owner = String(req.query.owner || '');
      const repo = String(req.query.repo || '');
      const number = parseInt(String(req.query.number || '0'), 10);

      if (!owner || !repo || !number) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: '"owner", "repo", and "number" are required.',
          },
        });
        return;
      }

      const issue = await GitHubService.getIssueByNumber(owner, repo, number);

      res.status(200).json({
        success: true,
        data: issue,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/repository/tech-stack
   * Real detection from repository config files (package.json, requirements.txt, Cargo.toml, etc.)
   */
  public static async getTechStack(
    req: Request,
    res: Response<ApiResponse<TechStackDetection>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metadata } = req.body;
      if (!metadata || !metadata.owner || !metadata.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_METADATA',
            message: 'Repository metadata is required to analyze the technology stack.',
          },
        });
        return;
      }

      const techStack = await TechStackService.detectTechStack(metadata);

      res.status(200).json({
        success: true,
        data: techStack,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/repository/installation-guide
   * Generates step-by-step setup guide derived from actual repository configuration files
   */
  public static async getInstallationGuide(
    req: Request,
    res: Response<ApiResponse<InstallationGuide>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metadata, techStack } = req.body;
      if (!metadata || !metadata.owner || !metadata.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_METADATA',
            message: 'Repository metadata is required to generate the installation guide.',
          },
        });
        return;
      }

      const activeTechStack = techStack || (await TechStackService.detectTechStack(metadata));
      const guide = await TechStackService.generateInstallationGuide(metadata, activeTechStack);

      res.status(200).json({
        success: true,
        data: guide,
      });
    } catch (err) {
      next(err);
    }
  }
}
