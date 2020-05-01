import * as child_process from 'child_process';
import { EventEmitter } from 'events';
import { ConcurrentRun } from '../ConcurrentRun';

const invalidCommands = [null, undefined, 0, 1, NaN, () => {}, function () {}, true, false, '', ' '];

jest.mock('child_process');

describe('ConcurrentRun', () => {
	const childProcessSpawn = {
		stderr: { on: jest.fn() },
		stdout: { on: jest.fn() },
		on: jest.fn(),
	};
	let concurrentRun: ConcurrentRun;

	beforeAll(() => {
		(child_process.spawn as jest.Mock).mockImplementation(() => childProcessSpawn);
	});

	beforeEach(() => (concurrentRun = new ConcurrentRun()));

	afterEach(() => jest.clearAllMocks());

	it('should create new EventEmitter', () => {
		expect(concurrentRun).toBeInstanceOf(EventEmitter);
	});

	describe('run', () => {
		it("should fail to run if commands parameter isn't array", () => {
			invalidCommands.forEach((cmd: any) => {
				expect(() => concurrentRun.run(cmd)).toThrow();
			});
		});

		it("should fail to run if some command is not a string or it's empty string", () => {
			invalidCommands.forEach((cmd: any) => {
				expect(() => concurrentRun.run([cmd])).toThrow();
			});
		});

		it('should spawn a new process', () => {
			process.env = { jest: 'true' };
			const spawnOptions = { shell: true, env: { FORCE_COLOR: '1', ...process.env } };

			concurrentRun.run(['command']);
			expect(child_process.spawn).toHaveBeenCalledWith('command', [], spawnOptions);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
			(child_process.spawn as jest.Mock).mockClear();

			concurrentRun.run(['command arg']);
			expect(child_process.spawn).toHaveBeenCalledWith('command', ['arg'], spawnOptions);
			expect(child_process.spawn).toHaveBeenCalledTimes(1);
			(child_process.spawn as jest.Mock).mockClear();

			concurrentRun.run(['command1 arg1', 'command2 arg2']);
			expect((child_process.spawn as jest.Mock).mock.calls[0]).toEqual(['command1', ['arg1'], spawnOptions]);
			expect((child_process.spawn as jest.Mock).mock.calls[1]).toEqual(['command2', ['arg2'], spawnOptions]);
			expect(child_process.spawn).toHaveBeenCalledTimes(2);
		});

		it('should emit on stderr to data event', (done) => {
			concurrentRun.on('data', (data: Buffer, command: string, index: number) => {
				expect(data).toBeInstanceOf(Buffer);
				expect(command).toBe('command arg');
				expect(index).toBe(0);
				done();
			});

			concurrentRun.run(['command arg']);

			const stderrOnCall = childProcessSpawn.stderr.on.mock.calls[0];
			expect(stderrOnCall[0]).toBe('data');
			expect(typeof stderrOnCall[1]).toBe('function');
			expect(stderrOnCall[1](Buffer.from('test'))).toBeTruthy();
		});

		it('should emit on stdout to data event', (done) => {
			concurrentRun.on('data', (data: Buffer, command: string, index: number) => {
				expect(data).toBeInstanceOf(Buffer);
				expect(command).toBe('command arg');
				expect(index).toBe(0);
				done();
			});

			concurrentRun.run(['command arg']);

			const stdoutOnCall = childProcessSpawn.stdout.on.mock.calls[0];
			expect(stdoutOnCall[0]).toBe('data');
			expect(typeof stdoutOnCall[1]).toBe('function');
			expect(stdoutOnCall[1](Buffer.from('test'))).toBeTruthy();
		});

		it('should emit to close event', (done) => {
			concurrentRun.on('close', (exitCode: number, command: string, index: number) => {
				expect(exitCode).toBe(0);
				expect(command).toBe('command arg');
				expect(index).toBe(0);
				done();
			});

			concurrentRun.run(['command arg']);

			const closeCall = childProcessSpawn.on.mock.calls[0];
			expect(closeCall[0]).toBe('close');
			expect(typeof closeCall[1]).toBe('function');
			expect(closeCall[1](0)).toBeTruthy();
		});

		it('should emit to error event', (done) => {
			concurrentRun.on('error', (err: Error, command: string, index: number) => {
				expect(err).toBeInstanceOf(Error);
				expect(command).toBe('command arg');
				expect(index).toBe(0);
				done();
			});

			concurrentRun.run(['command arg']);
			const errorCall = childProcessSpawn.on.mock.calls[1];
			expect(errorCall[0]).toBe('error');
			expect(typeof errorCall[1]).toBe('function');
			expect(errorCall[1](Error('test'))).toBeTruthy();
		});
	});

	it('should add listener and execute it on specific event', (done) => {
		const onSpy = jest.spyOn(concurrentRun, 'on');

		concurrentRun.on('data', done);

		const onCall = onSpy.mock.calls[0];
		expect(onCall[0]).toBe('data');
		expect(typeof onCall[1]).toBe('function');
		concurrentRun.emit('data');
	});

	it('should remove listener from specific event', () => {
		const fn = jest.fn();
		const offSpy = jest.spyOn(concurrentRun, 'off');

		concurrentRun.on('close', fn);
		concurrentRun.off('close', fn);

		const offCall = offSpy.mock.calls[0];
		expect(offCall[0]).toBe('close');
		expect(typeof offCall[1]).toBe('function');

		concurrentRun.emit('close');
		expect(fn).not.toHaveBeenCalled();
	});

	it('should add listener and execute it only once on specific event', () => {
		const fn = jest.fn();
		const onceSpy = jest.spyOn(concurrentRun, 'once');

		concurrentRun.once('error', fn);

		const onceCall = onceSpy.mock.calls[0];
		expect(onceCall[0]).toBe('error');
		expect(typeof onceCall[1]).toBe('function');

		concurrentRun.emit('error');
		expect(() => concurrentRun.emit('error')).toThrow();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('should return itself on every function call', () => {
		expect(concurrentRun.run(['command'])).toEqual(concurrentRun);
		expect(concurrentRun.on('data', jest.fn())).toEqual(concurrentRun);
		expect(concurrentRun.off('data', jest.fn())).toEqual(concurrentRun);
		expect(concurrentRun.once('error', jest.fn())).toEqual(concurrentRun);
	});
});
