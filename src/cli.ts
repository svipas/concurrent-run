#!/usr/bin/env node

import * as os from 'os';
import { color } from './color';
import { ConcurrentRun } from './ConcurrentRun';

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
		.on('data', (data: Buffer, command: string, index: number) => {
			command = getUniqueCommand(command, index);
			if (!executedCommands[command]) {
				executedCommands[command] = [data];
			} else {
				executedCommands[command].push(data);
			}
		})
		.on('close', (exitCode: number, command: string, index: number) => {
			const executedCommand = executedCommands[getUniqueCommand(command, index)];
			executedCommand?.forEach((data: Buffer) => {
				const lines = data.toString().split(os.EOL);
				lines.forEach((line) => {
					if (line.startsWith('\u001b[2K')) {
						line = line.replace('\u001b[2K', '');
					}
					if (line.startsWith('\u001b[1G')) {
						line = line.replace('\u001b[1G', '');
					}
					if (line === '' || line === '\u001b[2K') {
						return;
					}

					console.log(`${color.grey(`[${index}]`)} ${line}`);
				});
			});

			const exitMsg = color.bold(`[${index}] ${command} exited with ${exitCode}`);
			console.log(exitCode === 0 ? color.green(exitMsg) : color.red(exitMsg));
			console.log();

			if (exitCode !== 0) {
				process.exitCode = exitCode;
			}
		})
		.on('error', (err: Error, command: string) => {
			logError(`${color.grey(color.bold(`[${command}]`))} ${err.toString()}`);
			process.exit(1);
		});
} catch (err) {
	logError(err.message);
	process.exit(1);
}

function logError(text: string) {
	console.log(`${color.red('error')} ${text}`);
}

function getUniqueCommand(command: string, index: number) {
	return `[${index}] ${command}`;
}
