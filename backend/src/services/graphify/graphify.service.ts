import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { SandboxCloner } from './sandboxCloner.js';
import { GraphifyResult, GraphNode, GraphEdge } from '../../types/index.js';

const execFileAsync = promisify(execFile);

export class GraphifyService {
  private static cache = new Map<string, GraphifyResult>();

  /**
   * Checks if Graphify is locally installed and accessible via Python.
   */
  public static async checkAvailability(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await execFileAsync('python', ['-m', 'graphify', '--version'], {
        timeout: 5000,
      });
      return { available: true, version: stdout.trim() };
    } catch (err: any) {
      return { available: false, error: err.message };
    }
  }

  /**
   * Performs real, safe Graphify AST analysis on a public repository.
   */
  public static async analyzeRepository(owner: string, repo: string): Promise<GraphifyResult> {
    const cacheKey = `${owner}/${repo}`.toLowerCase();
    if (this.cache.has(cacheKey)) {
      logger.info(`Returning cached Graphify analysis for ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    const availability = await this.checkAvailability();
    if (!availability.available) {
      logger.warn(`Graphify is unavailable: ${availability.error}`);
      return {
        status: 'unavailable',
        message: 'Graphify Python module is not available in the current server environment.',
        nodes: [],
        edges: [],
        timestamp: new Date().toISOString(),
      };
    }

    let sandboxPath = '';
    try {
      // 1. Safe shallow clone
      sandboxPath = await SandboxCloner.cloneShallow(owner, repo);

      logger.info(`Running Graphify extract on sandbox: ${sandboxPath}`);

      // 2. Run Graphify local AST extraction (no API key required, zero code leaves server)
      // Command: python -m graphify extract <sandboxPath> --code-only
      try {
        const { stdout, stderr } = await execFileAsync(
          'python',
          ['-m', 'graphify', 'extract', sandboxPath, '--code-only'],
          {
            timeout: config.graphifyTimeoutMs,
            maxBuffer: 25 * 1024 * 1024,
          }
        );

        logger.debug(`Graphify output: ${stdout.slice(0, 300)}`);
        if (stderr && stderr.trim().length > 0) {
          logger.debug(`Graphify stderr: ${stderr.slice(0, 200)}`);
        }
      } catch (execErr: any) {
        logger.warn(`Graphify extract command notice: ${execErr.message}`);
      }

      // 3. Locate generated graphify-out/graph.json
      const possibleGraphPaths = [
        path.join(sandboxPath, 'graphify-out', 'graph.json'),
        path.join(sandboxPath, 'graph.json'),
        path.join(process.cwd(), 'graphify-out', 'graph.json'),
      ];

      let graphJsonContent: string | null = null;
      let actualGraphPath = '';

      for (const p of possibleGraphPaths) {
        try {
          const content = await fs.readFile(p, 'utf-8');
          if (content && content.trim().length > 0) {
            graphJsonContent = content;
            actualGraphPath = p;
            break;
          }
        } catch {}
      }

      // Also look for GRAPH_REPORT.md
      let reportMarkdown: string | undefined;
      const possibleReportPaths = [
        path.join(sandboxPath, 'graphify-out', 'GRAPH_REPORT.md'),
        path.join(process.cwd(), 'graphify-out', 'GRAPH_REPORT.md'),
      ];
      for (const rp of possibleReportPaths) {
        try {
          reportMarkdown = await fs.readFile(rp, 'utf-8');
          break;
        } catch {}
      }

      if (!graphJsonContent) {
        logger.warn(`Graphify executed but graph.json was not generated for ${owner}/${repo}`);
        const fallbackResult: GraphifyResult = {
          status: 'empty',
          message: 'No code symbols or relationships could be extracted for this repository language structure.',
          nodes: [],
          edges: [],
          reportMarkdown,
          timestamp: new Date().toISOString(),
        };
        this.cache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      // 4. Parse real graph data
      const parsedData = JSON.parse(graphJsonContent);
      const rawNodes = parsedData.nodes || [];
      const rawEdges = parsedData.edges || [];

      const nodes: GraphNode[] = rawNodes.slice(0, 200).map((n: any) => ({
        id: String(n.id || n.label || Math.random()),
        label: String(n.label || n.id || 'Symbol'),
        type: (n.type as any) || (n.id?.includes('.') ? 'file' : 'function'),
        filePath: n.source_file || n.file || undefined,
        communityId: n.community ?? undefined,
        communityName: n.community_name ?? undefined,
      }));

      // Filter edges to match valid node IDs
      const validNodeIds = new Set(nodes.map((n) => n.id));
      const edges: GraphEdge[] = rawEdges
        .filter((e: any) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target)))
        .slice(0, 300)
        .map((e: any) => ({
          source: String(e.source),
          target: String(e.target),
          relation: e.relation || 'references',
          confidence: e.confidence || 'EXTRACTED',
        }));

      const result: GraphifyResult = {
        status: 'success',
        message: `Extracted ${nodes.length} code entities and ${edges.length} relationships using Graphify AST analysis.`,
        nodes,
        edges,
        communities: parsedData.communities || undefined,
        godNodes: parsedData.god_nodes || undefined,
        reportMarkdown,
        timestamp: new Date().toISOString(),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (err: any) {
      logger.error(`Graphify analysis error on ${owner}/${repo}: ${err.message}`);
      return {
        status: 'error',
        message: `Code relationship analysis was unable to complete: ${err.message}`,
        nodes: [],
        edges: [],
        timestamp: new Date().toISOString(),
      };
    } finally {
      // 5. Always clean up temporary repository sandbox files
      if (sandboxPath) {
        await SandboxCloner.cleanup(sandboxPath);
      }
    }
  }
}
