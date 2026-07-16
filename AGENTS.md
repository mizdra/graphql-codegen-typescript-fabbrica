# AGENTS.md

## Project Overview

`@mizdra/graphql-codegen-typescript-fabbrica` is a GraphQL Code Generator plugin that generates type-safe mock data factories from a GraphQL schema. Users configure it in `codegen.ts` alongside the `typescript` plugin; the generated code exports `define<Type>Factory` functions that build strictly typed mock data for testing (with support for dynamic fields, sequences, traits, and transient fields).

## Commands

```bash
pnpm run build
pnpm run dev
pnpm run test
pnpm run test [<file...>]
pnpm run e2e
pnpm run lint
pnpm run lint:oxfmt [<file...>]
pnpm run lint:oxlint [<file...>]
pnpm run lint-fix
pnpm run lint-fix:oxfmt [<file...>]
pnpm run lint-fix:oxlint [<file...>]
```

## Entry Points

The package has two entry points:

- `.` (`src/index.ts`): The GraphQL Code Generator plugin. Runs at codegen time and generates `Optional<Type>` type definitions and `define<Type>Factory` functions from the schema.
- `./helper` (`src/helper/index.ts`): The runtime helper library imported by the generated code. Provides `defineTypeFactory`, `dynamic`, and sequence utilities.

## Development Flow

- Write PR descriptions and commit messages in English
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - `<type>` is one of: feat, fix, docs, refactor, test, chore, deps
  - Example: `feat: implement some feature`
- Assign appropriate labels when creating a PR
  - `Type: Breaking Change`: Breaking changes
  - `Type: Bug`: Bug fixes
  - `Type: Documentation`: Documentation changes
  - `Type: Feature`: New features
  - `Type: Refactoring`: Refactoring
  - `Type: Testing`: Test additions/modifications
  - `Type: Maintenance`: Repository maintenance
  - `Type: CI`: CI/CD changes
  - `Type: Security`: Security-related changes
  - `Type: Dependencies`: Dependency updates
