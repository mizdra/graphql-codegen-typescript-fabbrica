# Contributing

This is a guide for contributors.

## How to dev

- `npm run build`: Build for production
- `npm run lint`: Run static-checking
- `npm run test`: Run tests (except E2E tests)
- `npm run e2e`: Run E2E tests

## How to release

- Wait for passing CI...
- ```bash
  git switch main && git pull
  ```
- ```bash
  rm -rf dist && npm run build
  ```
- ```bash
  npm version <major|minor|patch>
  ```
  - If you want to release a pre-release version, use the following command instead:
    ```bash
    npm version <premajor|preminor|prepatch> --preid=<alpha|beta>
    ```
  - If you want to update the pre-release version, use the following command instead:
    ```bash
    npm version prerelease
    ```
- ```bash
  npm publish
  ```
  - If you want to publish a pre-release version, use the following command instead:
    ```bash
    npm publish --tag=<alpha|beta>
    ```
- ```bash
  git push --follow-tags
  ```
- Update the version of the package in a [playground](https://stackblitz.com/edit/playground-graphql-codegen-typescript-fabbrica?file=src%2Findex.test.ts&view=editor)
