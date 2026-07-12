import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { it } from 'vitest';

const projectDir = join(import.meta.dirname, '03-composite');

function run(command: string) {
  execSync(command, { cwd: projectDir, stdio: 'inherit' });
}

// Reproduction test for https://github.com/mizdra/graphql-codegen-typescript-fabbrica/issues/85.
// The project installs the package with `install-links=true` (see e2e/03-composite/.npmrc),
// which copies the package into node_modules instead of symlinking it.
it('can codegen and build a project using `composite: true`', () => {
  rmSync(join(projectDir, 'node_modules'), { recursive: true, force: true });
  run('npm install');
  run('npx graphql-codegen-esm');
  run('npx tsc');
});
