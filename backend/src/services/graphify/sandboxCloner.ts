import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const execFileAsync = promisify(execFile);

export class SandboxCloner {
  /**
   * Safely clones a public repository shallowly (--depth 1) into a temporary sandbox.
   * Enforces timeout and size limits to prevent abuse.
   */
  public static async cloneShallow(owner: string, repo: string): Promise<string> {
    const sandboxBase = path.resolve(config.graphifySandboxDir);
    await fs.mkdir(sandboxBase, { recursive: true });

    const safeOwner = owner.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeRepo = repo.replace(/[^a-zA-Z0-9_-]/g, '');
    const targetDir = path.join(sandboxBase, `${safeOwner}_${safeRepo}_${Date.now()}`);

    const repoUrl = `https://github.com/${safeOwner}/${safeRepo}.git`;
    logger.info(`Starting safe shallow clone of ${safeOwner}/${safeRepo} into sandbox: ${targetDir}`);

    try {
      // Execute git clone safely using execFile with separate arguments (prevents command injection)
      await execFileAsync(
        'git',
        ['clone', '--depth', '1', '--single-branch', repoUrl, targetDir],
        {
          timeout: 45000, // 45 second clone limit
          maxBuffer: 10 * 1024 * 1024,
        }
      );

      // Verify directory was created
      const stats = await fs.stat(targetDir);
      if (!stats.isDirectory()) {
        throw new Error('Sandbox clone directory was not created.');
      }

      // Remove .git folder immediately to save disk and isolate
      const gitDir = path.join(targetDir, '.git');
      try {
        await fs.rm(gitDir, { recursive: true, force: true });
      } catch (e) {
        // Non-fatal
      }

      return targetDir;
    } catch (err: any) {
      logger.error(`Failed to clone ${safeOwner}/${safeRepo}: ${err.message}`);
      // Clean up failed dir
      try {
        await fs.rm(targetDir, { recursive: true, force: true });
      } catch {}
      throw new Error(`Unable to clone repository safely for code relationship analysis: ${err.message}`);
    }
  }

  /**
   * Completely cleans up a sandbox directory.
   */
  public static async cleanup(targetDir: string): Promise<void> {
    try {
      // Security check: ensure targetDir is inside the sandbox base dir
      const resolved = path.resolve(targetDir);
      const sandboxBase = path.resolve(config.graphifySandboxDir);

      if (!resolved.startsWith(sandboxBase)) {
        logger.error(`Security violation: attempted to clean directory outside sandbox: ${targetDir}`);
        return;
      }

      await fs.rm(resolved, { recursive: true, force: true });
      logger.info(`Successfully cleaned up sandbox: ${resolved}`);
    } catch (err: any) {
      logger.warn(`Failed to clean up sandbox ${targetDir}: ${err.message}`);
    }
  }
}
