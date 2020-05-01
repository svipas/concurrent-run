import * as child_process from 'child_process';
import { EventEmitter } from 'events';

export class ConcurrentRun extends EventEmitter {
	run(commands: string[]): ConcurrentRun {
		if (!Array.isArray(commands)) {
			throw Error(`Expected type of commands parameter is array, received ${typeof commands}`);
		}
		if (commands.some((cmd) => typeof cmd !== 'string' || cmd.trim().length === 0)) {
			throw Error("Some command in the commands array is not a string or it's empty string");
		}

		commands.forEach((cmd: string, index: number) => {
			const splittedCommand = cmd.split(' ');
			const firstArg = splittedCommand[0];
			const allArgs = splittedCommand.slice(1);
			const executeCommand = child_process.spawn(firstArg, allArgs, {
				shell: true,
				env: { FORCE_COLOR: '1', ...process.env },
			});
			executeCommand.stderr.on('data', (data: Buffer) => this.emit('data', data, cmd, index));
			executeCommand.stdout.on('data', (data: Buffer) => this.emit('data', data, cmd, index));
			executeCommand.on('close', (exitCode: number) => this.emit('close', exitCode, cmd, index));
			executeCommand.on('error', (err: Error) => this.emit('error', err, cmd, index));
		});

		return this;
	}
}
