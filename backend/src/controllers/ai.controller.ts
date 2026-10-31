import { Request, Response, NextFunction } from 'express';
import { GemmaService } from '../services/gemma/gemma.service.js';
import {
  ApiResponse,
  RepositoryExplanation,
  IssueExplanation,
  BeginnerSuitability,
  ContributionRoadmap,
  GeneratedComment,
  ChatResponse,
} from '../types/index.js';

export class AiController {
  /**
   * POST /api/ai/explain-repository
   */
  public static async explainRepository(
    req: Request,
    res: Response<ApiResponse<RepositoryExplanation>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metadata } = req.body;
      if (!metadata || !metadata.fullName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Repository metadata is required to generate an explanation.',
          },
        });
        return;
      }

      const explanation = await GemmaService.explainRepository(metadata);
      res.status(200).json({
        success: true,
        data: explanation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/evaluate-issue
   */
  public static async evaluateIssue(
    req: Request,
    res: Response<ApiResponse<BeginnerSuitability>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { issue, repoContext } = req.body;
      if (!issue || !issue.number) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Valid GitHub issue data is required.',
          },
        });
        return;
      }

      const evaluation = await GemmaService.evaluateBeginnerSuitability(
        issue,
        repoContext || { fullName: 'repository', language: null }
      );
      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/explain-issue
   * Supports options: { isSimplified?: boolean, verifiedFiles?: string[] }
   */
  public static async explainIssue(
    req: Request,
    res: Response<ApiResponse<IssueExplanation>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { issue, repoMetadata, options } = req.body;
      if (!issue || !issue.number || !repoMetadata) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Both issue and repository metadata are required.',
          },
        });
        return;
      }

      const explanation = await GemmaService.explainIssue(issue, repoMetadata, options);
      res.status(200).json({
        success: true,
        data: explanation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/contribution-plan
   */
  public static async contributionPlan(
    req: Request,
    res: Response<ApiResponse<ContributionRoadmap>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { issue, repoMetadata, codeRelationshipsHint } = req.body;
      if (!issue || !issue.number || !repoMetadata) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Both issue and repository metadata are required.',
          },
        });
        return;
      }

      const roadmap = await GemmaService.generateContributionPlan(issue, repoMetadata, codeRelationshipsHint);
      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/generate-comment
   * Supports scenario and tone
   */
  public static async generateComment(
    req: Request,
    res: Response<ApiResponse<GeneratedComment>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { issue, scenario, tone, userContext } = req.body;
      if (!issue || !issue.number) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Issue details are required.',
          },
        });
        return;
      }

      const commentData = await GemmaService.generateGitHubComment(
        issue,
        scenario || 'express_interest',
        tone || 'Professional',
        userContext
      );
      res.status(200).json({
        success: true,
        data: commentData,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/chat
   * Contextual JIMMY AI Assistant Chatbot
   */
  public static async chat(
    req: Request,
    res: Response<ApiResponse<ChatResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { message, history, context } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MESSAGE',
            message: 'A message string is required.',
          },
        });
        return;
      }

      const chatResult = await GemmaService.chat(
        message.trim(),
        Array.isArray(history) ? history : [],
        context
      );

      res.status(200).json({
        success: true,
        data: chatResult,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/explain-relationship
   */
  public static async explainRelationship(
    req: Request,
    res: Response<ApiResponse<{ explanation: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { nodeName, nodeType, connectedNodes, repoName, issueTitle } = req.body;
      if (!nodeName || !nodeType || !repoName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'nodeName, nodeType, and repoName are required.',
          },
        });
        return;
      }

      const explanation = await GemmaService.explainGraphRelationship(
        nodeName,
        nodeType,
        Array.isArray(connectedNodes) ? connectedNodes : [],
        repoName,
        issueTitle
      );

      res.status(200).json({
        success: true,
        data: { explanation },
      });
    } catch (err) {
      next(err);
    }
  }
}
