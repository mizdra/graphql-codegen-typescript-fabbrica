# Contributing

This is a guide for contributors.

## How to dev

- `npm run build`: Build for production
- `npm run lint`: Run static-checking
- `npm run test`: Run unit tests
- `npm run e2e`: Run E2E tests
  - The E2E tests build the package automatically, so no manual build step is required.
  - To run only some of the E2E tests, use the `--project` option (e.g. `npm run e2e -- --project e2e-esm`).
    The available projects are `e2e-esm`, `e2e-browser`, and `e2e-composite`.
- Tests run once and exit by default. Pass `--watch` to enable watch mode (e.g. `npm run test -- --watch`).

## How to release

- Wait for passing CI...
- ```bash
  git switch main && git pull
  ```
- ```bash
  npm version <major|minor|patch>
  ```
- ```bash
  git push --follow-tags
  ```
- Approve a staged package on npmjs.com and publish it.
  - https://www.npmjs.com/settings/mizdra/staged-packages
- Update the version of the package in a [playground](https://stackblitz.com/edit/playground-graphql-codegen-typescript-fabbrica?file=src%2Findex.test.ts&view=editor)
