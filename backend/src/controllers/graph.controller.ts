import { Request, Response, NextFunction } from 'express';
import { GraphifyService } from '../services/graphify/graphify.service.js';
import { validateAndParseGitHubUrl } from '../services/github/urlValidator.js';
import { ApiResponse, GraphifyResult } from '../types/index.js';

export class GraphController {
  /**
   * POST /api/graph/analyze
   * Clones repository safely in sandbox and executes local Graphify AST analysis.
   */
  public static async analyze(
    req: Request,
    res: Response<ApiResponse<GraphifyResult>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { url } = req.body;
      const parsed = validateAndParseGitHubUrl(url);

      if (!parsed.isValid || !parsed.owner || !parsed.repo) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: parsed.error || 'A valid public GitHub URL is required for code relationship analysis.',
          },
        });
        return;
      }

      const result = await GraphifyService.analyzeRepository(parsed.owner, parsed.repo);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/graph/status
   * Checks Graphify module availability on host environment.
   */
  public static async getStatus(
    _req: Request,
    res: Response<ApiResponse<{ available: boolean; version?: string; error?: string }>>
  ): Promise<void> {
    const status = await GraphifyService.checkAvailability();
    res.status(200).json({
      success: true,
      data: status,
    });
  }
}
