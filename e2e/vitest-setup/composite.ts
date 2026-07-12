import type { TestProject } from 'vitest/node';
import { ensureBuild } from './build.js';

export default function setup(project: TestProject) {
  // The dist directory must be built before `npm install` copies the package
  // into e2e/03-composite/node_modules.
  ensureBuild();
  project.onTestsRerun(() => ensureBuild());
}
