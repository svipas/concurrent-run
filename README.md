# concurrent-run &middot; [![npm](https://img.shields.io/npm/v/concurrent-run.svg)](https://www.npmjs.com/package/concurrent-run) [![Build Status](https://dev.azure.com/svipas/svipas/_apis/build/status/svipas.concurrent-run?branchName=master)](https://dev.azure.com/svipas/svipas/_build/latest?definitionId=2&branchName=master)

Simple, zero dependency, multiple commands runner in concurrent mode.

<img src="./demo.gif" width="70%">

## Installation

### npm

```
npm install --save-dev concurrent-run
```

### Yarn

```
yarn add --dev concurrent-run
```

## Usage

### CLI

`concurrent-run "command1 arg" "command2 arg"`

Always surround multiple commands with quotes, otherwise, everything will be treated as a single command.

### API

```ts
import { ConcurrentRun, Command } from "concurrent-run";

const concurrent = new ConcurrentRun();

concurrent
	.run(["command1 arg", "command2 arg"])
	.on("data", (data: Buffer, command: Command) => {
		// data from spawned process stderr and stdout
	})
	.on("close", (exitCode: number, command: Command) => {
		// after command is finished
	})
	.on("error", (err: Error, command: Command) => {
		// after an error occurs
	});
```

#### Events

- `data` gets called once `stderr` or `stdout` of spawned process sends data.

```ts
import { ConcurrentRun, Command } from "concurrent-run";

const concurrent = new ConcurrentRun();

concurrent
	.run(["command1 arg"])
	.on("data", (data: Buffer, command: Command) => {
		// do something...
	});
```

- `close` gets called once command is finished.

```ts
import { ConcurrentRun, Command } from "concurrent-run";

const concurrent = new ConcurrentRun();

concurrent
	.run(["command1 arg"])
	.on("close", (exitCode: number, command: Command) => {
		// do something...
	});
```

- `error` gets called once an error occurs.

```ts
import { ConcurrentRun, Command } from "concurrent-run";

const concurrent = new ConcurrentRun();

concurrent
	.run(["command1 arg"])
	.on("error", (err: Error, command: Command) => {
	// do something...
});
```

## Contributing

Feel free to open issues or PRs!
