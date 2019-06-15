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
