import * as child_process from "child_process";
import { EventEmitter } from "events";
import { Command } from "./Command";

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

		commands.forEach((text: string, index: number) => {
			const [cmd, ...args] = text.split(" ");
			const command = new Command(cmd, args, index);
			const executeCommand = child_process.spawn(cmd, args, {
				shell: true,
				env: { FORCE_COLOR: "1", ...process.env },
			});
			executeCommand.stderr.on("data", (data: Buffer) => {
				return this._eventEmitter.emit("data", data, command);
			});
			executeCommand.stdout.on("data", (data: Buffer) => {
				return this._eventEmitter.emit("data", data, command);
			});
			executeCommand.on("close", (exitCode: number) => {
				return this._eventEmitter.emit("close", exitCode, command);
			});
			executeCommand.on("error", (err: Error) => {
				return this._eventEmitter.emit("error", err, command);
			});
		});

		return this;
	}

	public on(
		event: "data",
		listener: (data: Buffer, command: Command) => void
	): this;

	public on(
		event: "close",
		listener: (exitCode: number, command: Command) => void
	): this;

	public on(
		event: "error",
		listener: (err: Error, command: Command) => void
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
