import { execSync } from 'child_process';

let cachedCommitHash: string | null = null;

const GIT_REV_PARSE_COMMAND = 'git rev-parse HEAD';

export const getGitCommitHash = (): string => {
  if (cachedCommitHash) {
    return cachedCommitHash;
  }

  try {
    const output = execSync(GIT_REV_PARSE_COMMAND, {
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const hash = output.toString().trim();
    cachedCommitHash = hash.length > 0 ? hash : 'unknown';
  } catch (error) {
    cachedCommitHash = 'unknown';
  }

  return cachedCommitHash;
};
