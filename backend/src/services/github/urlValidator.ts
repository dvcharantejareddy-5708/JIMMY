export interface ParsedGitHubUrl {
  isValid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

/**
 * Validates and extracts owner and repository name from a public GitHub URL.
 */
export function validateAndParseGitHubUrl(rawUrl: string): ParsedGitHubUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Repository URL is required.' };
  }

  const trimmed = rawUrl.trim();

  // Basic check for protocols
  let normalized = trimmed;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized);

    // Hostname must be github.com
    if (parsed.hostname.toLowerCase() !== 'github.com' && parsed.hostname.toLowerCase() !== 'www.github.com') {
      return { isValid: false, error: 'Only public github.com repositories are supported.' };
    }

    // Pathname should be /owner/repo or /owner/repo/
    const segments = parsed.pathname
      .split('/')
      .filter((s) => s.length > 0);

    if (segments.length !== 2) {
      return {
        isValid: false,
        error: 'Invalid GitHub repository format. Expected: https://github.com/owner/repo',
      };
    }

    const [owner, rawRepo] = segments;
    // Strip trailing .git if present
    const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo;

    // Validate characters (GitHub username and repo rules)
    // Usernames: alphanumeric or single hyphens, cannot start/end with hyphen
    // Repos: alphanumeric, hyphens, underscores, dots
    const ownerRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    const repoRegex = /^[a-zA-Z0-9_.-]{1,100}$/;

    if (!ownerRegex.test(owner)) {
      return { isValid: false, error: `Invalid GitHub owner/organization name: "${owner}".` };
    }

    if (!repoRegex.test(repo)) {
      return { isValid: false, error: `Invalid GitHub repository name: "${repo}".` };
    }

    return {
      isValid: true,
      owner,
      repo,
    };
  } catch {
    return { isValid: false, error: 'Malformed URL provided.' };
  }
}
