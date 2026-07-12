import { execSync } from 'node:child_process';

// The e2e projects share this function via their global setup scripts. Vitest evaluates
// each project's global setup in the same process, so an environment variable is used to
// avoid building multiple times per run.
export function ensureBuild(): void {
  if (process.env['FABBRICA_E2E_BUILT'] === 'true') return;
  execSync('npm run build', { stdio: 'inherit' });
  process.env['FABBRICA_E2E_BUILT'] = 'true';
}
