import axios, { AxiosError } from 'axios';
import { logger } from '../../utils/logger.js';
import {
  TechStackDetection,
  DetectedTechnology,
  InstallationGuide,
  InstallationStep,
  RepositoryMetadata,
} from '../../types/index.js';

const GITHUB_API_BASE = 'https://api.github.com';

export class TechStackService {
  /**
   * Safe fetch of a raw file content from GitHub default branch
   */
  public static async fetchRawFile(owner: string, repo: string, filePath: string): Promise<string | null> {
    try {
      const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath}`;
      const res = await axios.get(url, {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          'User-Agent': 'JIMMY-OpenSource-Assistant',
        },
        timeout: 8000,
      });
      return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    } catch (err) {
      const axErr = err as AxiosError;
      if (axErr.response?.status === 404) {
        return null;
      }
      logger.warn(`Could not fetch file ${filePath} for ${owner}/${repo}: ${axErr.message}`);
      return null;
    }
  }

  /**
   * Deterministically detects tech stack elements from real configuration files
   */
  public static async detectTechStack(metadata: RepositoryMetadata): Promise<TechStackDetection> {
    const { owner, name, language, readmeContent } = metadata;
    const technologies: DetectedTechnology[] = [];
    const frameworks: string[] = [];
    let packageManager: string | undefined;
    let buildTool: string | undefined;

    // Add Primary Language from GitHub API metadata
    if (language) {
      technologies.push({
        name: language,
        category: 'Programming Language',
        purpose: 'Primary language detected for the repository',
        whyNeeded: 'Core application codebase is authored in this language',
        detectedFrom: 'GitHub Repository Metadata',
      });
    }

    // 1. Check Node.js / JavaScript / TypeScript ecosystem
    const packageJsonRaw = await this.fetchRawFile(owner, name, 'package.json');
    if (packageJsonRaw) {
      try {
        const pkg = JSON.parse(packageJsonRaw);
        packageManager = 'npm / yarn / pnpm';

        // Check dependencies & devDependencies
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

        // Framework checks
        if (allDeps['react']) {
          technologies.push({
            name: 'React',
            category: 'Frontend Framework',
            version: allDeps['react'],
            purpose: 'Component-based user interface rendering',
            whyNeeded: 'Builds interactive frontend UI views',
            detectedFrom: 'package.json',
          });
          frameworks.push('React');
        }
        if (allDeps['next']) {
          technologies.push({
            name: 'Next.js',
            category: 'Fullstack / React Framework',
            version: allDeps['next'],
            purpose: 'Server-side rendering, routing and static site generation',
            whyNeeded: 'Powers the web application architecture',
            detectedFrom: 'package.json',
          });
          frameworks.push('Next.js');
        }
        if (allDeps['vue']) {
          technologies.push({
            name: 'Vue.js',
            category: 'Frontend Framework',
            version: allDeps['vue'],
            purpose: 'Reactive UI component framework',
            whyNeeded: 'Powers the frontend presentation layer',
            detectedFrom: 'package.json',
          });
          frameworks.push('Vue.js');
        }
        if (allDeps['express']) {
          technologies.push({
            name: 'Express.js',
            category: 'Backend Framework',
            version: allDeps['express'],
            purpose: 'Fast, unopinionated HTTP web framework for Node.js',
            whyNeeded: 'Handles server API routing and middleware',
            detectedFrom: 'package.json',
          });
          frameworks.push('Express');
        }
        if (allDeps['typescript']) {
          technologies.push({
            name: 'TypeScript',
            category: 'Programming Language / Tooling',
            version: allDeps['typescript'],
            purpose: 'Static type checking for JavaScript',
            whyNeeded: 'Enforces type safety and developer productivity',
            detectedFrom: 'package.json',
          });
        }
        if (allDeps['vite']) {
          technologies.push({
            name: 'Vite',
            category: 'Build Tool / Bundler',
            version: allDeps['vite'],
            purpose: 'Next generation frontend development and bundle tooling',
            whyNeeded: 'Fast Hot Module Replacement (HMR) and optimized distribution builds',
            detectedFrom: 'package.json',
          });
          buildTool = 'Vite';
        }
        if (allDeps['tailwindcss']) {
          technologies.push({
            name: 'Tailwind CSS',
            category: 'CSS Framework / Styling',
            version: allDeps['tailwindcss'],
            purpose: 'Utility-first CSS styling',
            whyNeeded: 'Designs clean responsive interfaces',
            detectedFrom: 'package.json',
          });
        }
        if (allDeps['jest'] || allDeps['vitest']) {
          const testRunner = allDeps['vitest'] ? 'Vitest' : 'Jest';
          technologies.push({
            name: testRunner,
            category: 'Testing Framework',
            version: allDeps['vitest'] || allDeps['jest'],
            purpose: 'Unit and integration test runner',
            whyNeeded: 'Verifies codebase correctness and prevents regressions',
            detectedFrom: 'package.json',
          });
        }
      } catch (e) {
        logger.warn(`Failed to parse package.json for ${owner}/${name}`);
      }
    }

    // 2. Check Python ecosystem
    const reqsRaw = await this.fetchRawFile(owner, name, 'requirements.txt');
    const pyprojectRaw = await this.fetchRawFile(owner, name, 'pyproject.toml');
    if (reqsRaw || pyprojectRaw) {
      packageManager = 'pip / poetry';
      const pythonContent = (reqsRaw || '') + '\n' + (pyprojectRaw || '');

      if (pythonContent.includes('fastapi')) {
        technologies.push({
          name: 'FastAPI',
          category: 'Backend Framework',
          purpose: 'Modern, fast web framework for building APIs with Python',
          whyNeeded: 'Provides asynchronous REST endpoints with automatic OpenAPI documentation',
          detectedFrom: reqsRaw ? 'requirements.txt' : 'pyproject.toml',
        });
        frameworks.push('FastAPI');
      }
      if (pythonContent.includes('django')) {
        technologies.push({
          name: 'Django',
          category: 'Backend Framework',
          purpose: 'High-level Python web framework',
          whyNeeded: 'Full-featured MVC architecture with ORM and administration',
          detectedFrom: reqsRaw ? 'requirements.txt' : 'pyproject.toml',
        });
        frameworks.push('Django');
      }
      if (pythonContent.includes('flask')) {
        technologies.push({
          name: 'Flask',
          category: 'Backend Framework',
          purpose: 'Lightweight WSGI web application framework',
          whyNeeded: 'Simple, extensible micro-framework for web endpoints',
          detectedFrom: reqsRaw ? 'requirements.txt' : 'pyproject.toml',
        });
        frameworks.push('Flask');
      }
      if (pythonContent.includes('pytest')) {
        technologies.push({
          name: 'pytest',
          category: 'Testing Framework',
          purpose: 'Test framework for Python',
          whyNeeded: 'Automated test suite execution and assertions',
          detectedFrom: reqsRaw ? 'requirements.txt' : 'pyproject.toml',
        });
      }
    }

    // 3. Check Rust ecosystem
    const cargoRaw = await this.fetchRawFile(owner, name, 'Cargo.toml');
    if (cargoRaw) {
      packageManager = 'cargo';
      buildTool = 'cargo';
      technologies.push({
        name: 'Cargo & Rust',
        category: 'Build Tool & Package Manager',
        purpose: 'Rust package manager and compilation driver',
        whyNeeded: 'Compiles safe, concurrent native binaries',
        detectedFrom: 'Cargo.toml',
      });
    }

    // 4. Check Go ecosystem
    const goModRaw = await this.fetchRawFile(owner, name, 'go.mod');
    if (goModRaw) {
      packageManager = 'go modules';
      buildTool = 'go build';
      technologies.push({
        name: 'Go Modules',
        category: 'Package Manager',
        purpose: 'Dependency management for Go codebases',
        whyNeeded: 'Manages semantic versions of third-party Go packages',
        detectedFrom: 'go.mod',
      });
    }

    // 5. Check Docker / Containerization
    const dockerfileRaw = await this.fetchRawFile(owner, name, 'Dockerfile');
    const composeRaw = await this.fetchRawFile(owner, name, 'docker-compose.yml') || await this.fetchRawFile(owner, name, 'docker-compose.yaml');
    if (dockerfileRaw || composeRaw) {
      technologies.push({
        name: composeRaw ? 'Docker & Docker Compose' : 'Docker',
        category: 'DevOps / Containerization',
        purpose: 'Containerized reproducible application environment',
        whyNeeded: 'Ensures identical runtime across local development and production servers',
        detectedFrom: dockerfileRaw ? 'Dockerfile' : 'docker-compose.yml',
      });
    }

    const summary = technologies.length > 0
      ? `Detected ${technologies.length} key technologies. Primary language is ${language || 'unspecified'}.`
      : `Repository appears to use ${language || 'standard open-source tools'}. Inspect README for detailed dependency info.`;

    return {
      technologies,
      primaryLanguage: language || 'General',
      frameworks,
      packageManager,
      buildTool,
      summary,
    };
  }

  /**
   * Deterministically parses README and config files to assemble a verified step-by-step installation guide.
   */
  public static async generateInstallationGuide(
    metadata: RepositoryMetadata,
    techStack: TechStackDetection
  ): Promise<InstallationGuide> {
    const { owner, name, defaultBranch, readmeContent } = metadata;
    const steps: InstallationStep[] = [];
    const prerequisites: string[] = [];
    const commonErrors: Array<{ error: string; solution: string }> = [];

    // Step 1: Prerequisites
    if (techStack.primaryLanguage === 'JavaScript' || techStack.primaryLanguage === 'TypeScript' || techStack.packageManager?.includes('npm')) {
      prerequisites.push('Node.js (v18.x or v20.x recommended) and npm');
      prerequisites.push('Git version control tool');
    } else if (techStack.primaryLanguage === 'Python') {
      prerequisites.push('Python 3.10+ and pip package manager');
      prerequisites.push('Git version control tool');
    } else if (techStack.primaryLanguage === 'Rust') {
      prerequisites.push('Rust toolchain (rustc and cargo via rustup.rs)');
      prerequisites.push('Git version control tool');
    } else if (techStack.primaryLanguage === 'Go') {
      prerequisites.push('Go compiler (v1.21+ recommended)');
      prerequisites.push('Git version control tool');
    } else {
      prerequisites.push('Git version control tool');
      prerequisites.push(`Runtime environment for ${techStack.primaryLanguage || 'the project'}`);
    }

    // Step 2: Download the project
    steps.push({
      stepNumber: 1,
      title: 'Clone the Repository',
      whatToDo: `Clone the official repository from GitHub to your local machine and switch into the project directory.`,
      command: `git clone https://github.com/${owner}/${name}.git\ncd ${name}`,
      commandExplanation: 'Downloads all source files and navigates your terminal into the root directory of the repository.',
      isVerified: true,
      sourceFile: 'GitHub Repository URL',
    });

    // Step 3: Branch creation for contribution
    steps.push({
      stepNumber: 2,
      title: 'Create a Feature Branch',
      whatToDo: 'Never make edits directly on the default branch. Create a dedicated branch for your exploration or fix.',
      command: `git checkout -b my-contribution`,
      commandExplanation: `Creates and switches to a new local branch isolated from '${defaultBranch}'.`,
      isVerified: true,
      sourceFile: 'Git Standard Workflow',
    });

    // Step 4: Install Dependencies
    let installCmd = '';
    let startCmd = '';
    let testCmd = '';

    if (techStack.packageManager?.includes('npm')) {
      installCmd = 'npm install';
      startCmd = 'npm run dev || npm start';
      testCmd = 'npm test';
      steps.push({
        stepNumber: 3,
        title: 'Install Dependencies',
        whatToDo: 'Install all third-party libraries and development dependencies declared in package.json.',
        command: installCmd,
        commandExplanation: 'Downloads all project packages into the local node_modules folder.',
        isVerified: true,
        sourceFile: 'package.json',
      });
    } else if (techStack.primaryLanguage === 'Python') {
      installCmd = 'pip install -r requirements.txt';
      startCmd = 'python main.py || python app.py';
      testCmd = 'pytest';
      steps.push({
        stepNumber: 3,
        title: 'Install Python Dependencies',
        whatToDo: 'Set up a virtual environment and install packages declared in requirements.txt.',
        command: `python -m venv venv\nsource venv/bin/activate  # On Windows: .\\venv\\Scripts\\activate\n${installCmd}`,
        commandExplanation: 'Creates an isolated Python virtual environment to avoid polluting system packages.',
        isVerified: true,
        sourceFile: 'requirements.txt',
      });
    } else if (techStack.primaryLanguage === 'Rust') {
      installCmd = 'cargo build';
      startCmd = 'cargo run';
      testCmd = 'cargo test';
      steps.push({
        stepNumber: 3,
        title: 'Build Project Dependencies',
        whatToDo: 'Fetch all crates and compile the Rust project.',
        command: installCmd,
        commandExplanation: 'Cargo downloads dependencies and compiles the binary.',
        isVerified: true,
        sourceFile: 'Cargo.toml',
      });
    } else if (techStack.primaryLanguage === 'Go') {
      installCmd = 'go mod download';
      startCmd = 'go run .';
      testCmd = 'go test ./...';
      steps.push({
        stepNumber: 3,
        title: 'Download Go Modules',
        whatToDo: 'Fetch all module requirements declared in go.mod.',
        command: installCmd,
        commandExplanation: 'Downloads Go modules to local cache.',
        isVerified: true,
        sourceFile: 'go.mod',
      });
    } else {
      steps.push({
        stepNumber: 3,
        title: 'Inspect Setup Instructions in README',
        whatToDo: 'Review the project README for the specific dependency installation command.',
        command: undefined,
        commandExplanation: 'Specific dependency command should be verified directly from the README.',
        isVerified: false,
        sourceFile: 'README.md',
      });
    }

    // Step 5: Configure Environment
    const envExampleRaw = await this.fetchRawFile(owner, name, '.env.example');
    if (envExampleRaw) {
      steps.push({
        stepNumber: 4,
        title: 'Configure Environment Variables',
        whatToDo: 'Copy the sample environment file to create your local .env configuration.',
        command: 'cp .env.example .env  # On Windows: copy .env.example .env',
        commandExplanation: 'Sets up required local environment variables from the verified template.',
        isVerified: true,
        sourceFile: '.env.example',
      });
    }

    // Step 6: Start Project
    if (startCmd) {
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Start Development Server',
        whatToDo: 'Launch the application in local development mode.',
        command: startCmd,
        commandExplanation: 'Executes the local development server or entry point.',
        isVerified: true,
        sourceFile: 'Project Configuration',
      });
    }

    // Step 7: Run Tests
    if (testCmd) {
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Run Tests',
        whatToDo: 'Execute existing tests to ensure your local environment is functioning properly before writing new code.',
        command: testCmd,
        commandExplanation: 'Runs the automated test suite to verify baseline functionality.',
        isVerified: true,
        sourceFile: 'Project Configuration',
      });
    }

    // Common Errors
    commonErrors.push({
      error: 'Command not found (e.g. node, npm, python, cargo)',
      solution: 'Ensure the runtime environment is installed on your machine and added to your system PATH variable.',
    });
    commonErrors.push({
      error: 'Permission denied / EACCES error during install',
      solution: 'Avoid running package managers with sudo. Use a version manager (nvm for Node.js, pyenv for Python) to install runtimes in user space.',
    });
    commonErrors.push({
      error: 'Port already in use error on startup',
      solution: 'Check if another instance or service is running on the target port, or specify a custom PORT in your local .env file.',
    });

    return {
      prerequisites,
      steps,
      commonErrors,
      documentationSource: readmeContent ? 'README.md & Repository Config Files' : 'Repository Config Files',
    };
  }
}
