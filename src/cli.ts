#!/usr/bin/env node

import * as os from "os";
import { color } from "./color";
import { Command } from "./Command";
import { ConcurrentRun } from "./ConcurrentRun";

const cmdArgs = process.argv.slice(2);
if (cmdArgs.length === 0) {
	logError('Usage: concurrent-run "command1 arg1" "command2 arg2"');
	process.exit(1);
}

try {
	console.log();

	const executedCommands: { [key: string]: Buffer[] } = {};

	new ConcurrentRun()
		.run(cmdArgs)
		.on("data", (data: Buffer, command: Command) => {
			if (!executedCommands[command.key]) {
				executedCommands[command.key] = [data];
			} else {
				executedCommands[command.key].push(data);
			}
		})
		.on("close", (exitCode: number, command: Command) => {
			executedCommands[command.key]?.forEach((data: Buffer) => {
				const lines = data.toString().split(os.EOL);
				lines.forEach((line) => {
					if (line.startsWith("\u001b[2K")) {
						line = line.replace("\u001b[2K", "");
					}
					if (line.startsWith("\u001b[1G")) {
						line = line.replace("\u001b[1G", "");
					}
					if (line === "" || line === "\u001b[2K") {
						return;
					}

					console.log(`${color.grey(`[${command.index}]`)} ${line}`);
				});
			});

			const exitMsg = color.bold(`${command.key} exited with ${exitCode}`);
			console.log(exitCode === 0 ? color.green(exitMsg) : color.red(exitMsg));
			console.log();

			if (exitCode !== 0) {
				process.exitCode = exitCode;
			}
		})
		.on("error", (err: Error, command: Command) => {
			logError(
				`${color.grey(color.bold(`[${command.cmd}]`))} ${err.toString()}`
			);
			process.exit(1);
		});
} catch (err) {
	logError(err.message);
	process.exit(1);
}

function logError(text: string) {
	console.log(`${color.red("error")} ${text}`);
}
