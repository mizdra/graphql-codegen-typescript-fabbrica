# Contributing

This is a guide for contributors.

## How to dev

- `npm run build`: Build for production
- `npm run lint`: Run static-checking
- `npm run test`: Run all tests (unit and E2E)
  - The E2E tests build the package automatically, so no manual build step is required.
  - To run only some of the tests, use the `--project` option (e.g. `npx vitest --project unit`).
    The available projects are `unit`, `e2e-esm`, `e2e-browser`, and `e2e-composite`.

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
