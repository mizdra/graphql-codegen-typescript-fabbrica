import { execSync } from 'node:child_process';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';
import { ensureBuild } from './build.js';

const projectDir = join(import.meta.dirname, '../01-esm');

function prepare() {
  ensureBuild();
  execSync('npx graphql-codegen-esm', { cwd: projectDir, stdio: 'inherit' });
}

export default function setup(project: TestProject) {
  prepare();
  project.onTestsRerun(() => prepare());
}
