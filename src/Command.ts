export class Command {
	public readonly key: string;

	constructor(
		public readonly cmd: string,
		public readonly args: string[],
		public readonly index: number
	) {
		this.key = `[${index}] ${cmd}`;
	}
}
