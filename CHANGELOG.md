## [Unreleased]

## 2.3.6 (June 25, 2020)

- Update all dependencies.

## 2.3.5 (May 19, 2020)

- Reformat project with new settings.
- Update all dependencies.
- Create and emit `Command` class with `cmd`, `args`, `index` and `key` properties.

## 2.3.4 (May 13, 2020)

- Add typings for all events in `ConcurrentRun` class.
- Update all dependencies.

## 2.3.3 (May 2, 2020)

- Generate declaration file and include it in the `package.json`.

## 2.3.2 (May 1, 2020)

- Change indentation to tabs.
- Update all dependencies.
- Rename `__test__` dir to `__tests__`.

## 2.3.1 (March 9, 2020)

- Add homepage to `package.json`.
- Add `tsconfig.json` and `babel.config.js` to `.npmignore`.

## 2.3.0 (March 9, 2020)

- Update dependencies and add TypeScript.
- Rewrite everything to TypeScript.
- Change filename convention to use camelCase.
- Drop ESLint.

## 2.2.3 (October 24, 2019)

- Update dependencies.
- Update `azure-pipelines.yml` to use Node 12 and fix triggers.

## 2.2.2 (August 11, 2019)

- Update all dependencies.
- Add `.eslintrc.json` and `azure-pipelines.yml` to `.npmignore`.
- Update `README.md`.

## 2.2.1 (June 22, 2019)

- Change filename convention to use hyphen.
- Update all dependencies.

## 2.2.0 (June 15, 2019)

### API

- Fix Windows by adding `shell: true` in spawn options.

### CI

- Add additional step to test CLI in Azure Pipelines.

## 2.1.0 (June 15, 2019)

### CLI

- Fix name collision of executed commands.
- Add a conditional statement to check if the command was executed before printing its data.

### Scripts

- Add `prepublishOnly` script to run `yarn lint` and `yarn test` concurrently.

## 2.0.0 (June 15, 2019)

- Rewrite everything from scratch.
- Now it can be run by using newly added `ConcurrentRun` class which means you can call it programmatically.
- 100% test coverage.
- Add an index for each command to improve visual distinguish between multiple commands.
- Cross-platform support.

## 1.0.1 (February 10, 2019)

- Fix CLI by adding `#!/usr/bin/env node`.

## 1.0.0 (February 10, 2019)

- Initial release.
