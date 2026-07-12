import { execSync } from 'node:child_process';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';
import { ensureBuild } from './build.js';

const projectDir = join(import.meta.dirname, '../02-browser');

function prepare() {
  ensureBuild();
  execSync('npx graphql-codegen-esm', { cwd: projectDir, stdio: 'inherit' });
}

export default function setup(project: TestProject) {
  // A no-op if the browser is already installed.
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  prepare();
  project.onTestsRerun(() => prepare());
}
