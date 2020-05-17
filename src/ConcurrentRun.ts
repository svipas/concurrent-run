import * as child_process from "child_process";
import { EventEmitter } from "events";

type ConcurrentRunEvent = "data" | "close" | "error";
type Listener = (...args: any[]) => void;

export class ConcurrentRun {
	private readonly _eventEmitter = new EventEmitter();

	run(commands: string[]): ConcurrentRun {
		if (!Array.isArray(commands)) {
			throw new Error(
				`Expected type of commands parameter is array, received ${typeof commands}.`
			);
		}
		if (
			commands.some((cmd) => typeof cmd !== "string" || cmd.trim().length === 0)
		) {
			throw new Error(
				"Some command in the commands array is not a string or it's empty string."
			);
		}

		commands.forEach((cmd: string, index: number) => {
			const splittedCommands = cmd.split(" ");
			const firstArg = splittedCommands[0];
			const remainingArgs = splittedCommands.slice(1);
			const executeCommand = child_process.spawn(firstArg, remainingArgs, {
				shell: true,
				env: { FORCE_COLOR: "1", ...process.env },
			});
			executeCommand.stderr.on("data", (data: Buffer) => {
				this._eventEmitter.emit("data", data, cmd, index);
			});
			executeCommand.stdout.on("data", (data: Buffer) => {
				this._eventEmitter.emit("data", data, cmd, index);
			});
			executeCommand.on("close", (exitCode: number) => {
				this._eventEmitter.emit("close", exitCode, cmd, index);
			});
			executeCommand.on("error", (err: Error) => {
				this._eventEmitter.emit("error", err, cmd, index);
			});
		});

		return this;
	}

	public on(
		event: "data",
		listener: (data: Buffer, cmd: string, index: number) => void
	): this;

	public on(
		event: "close",
		listener: (exitCode: number, cmd: string, index: number) => void
	): this;

	public on(
		event: "error",
		listener: (err: Error, cmd: string, index: number) => void
	): this;

	on(event: ConcurrentRunEvent, listener: Listener): this {
		this._eventEmitter.on(event, listener);
		return this;
	}

	once(event: ConcurrentRunEvent, listener: Listener): this {
		this._eventEmitter.once(event, listener);
		return this;
	}

	off(event: ConcurrentRunEvent, listener: Listener): this {
		this._eventEmitter.off(event, listener);
		return this;
	}

	removeAllListeners(event?: ConcurrentRunEvent): this {
		this._eventEmitter.removeAllListeners(event);
		return this;
	}

	setMaxListeners(size: number): this {
		this._eventEmitter.setMaxListeners(size);
		return this;
	}

	getMaxListeners(): number {
		return this._eventEmitter.getMaxListeners();
	}

	listeners(event: ConcurrentRunEvent): Function[] {
		return this._eventEmitter.listeners(event);
	}

	rawListeners(event: ConcurrentRunEvent): Function[] {
		return this._eventEmitter.rawListeners(event);
	}

	listenerCount(event: ConcurrentRunEvent): number {
		return this._eventEmitter.listenerCount(event);
	}

	prependListener(event: ConcurrentRun, listener: Listener): this {
		this._eventEmitter.prependListener(event as any, listener);
		return this;
	}

	prependOnceListener(event: ConcurrentRun, listener: Listener): this {
		this._eventEmitter.prependOnceListener(event as any, listener);
		return this;
	}

	eventNames(): (string | symbol)[] {
		return this._eventEmitter.eventNames();
	}
}
