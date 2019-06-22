const { ConcurrentRun } = require('../concurrent-run');
const { EventEmitter } = require('events');
const child_process = require('child_process');
const invalidCommands = [null, undefined, 0, 1, NaN, () => {}, function() {}, true, false, '', ' '];

describe('ConcurrentRun', () => {
  const childProcessSpawn = {
    stderr: { on: jest.fn() },
    stdout: { on: jest.fn() },
    on: jest.fn()
  };
  let concurrentRun;

  beforeAll(() => (child_process.spawn = jest.fn(() => childProcessSpawn)));

  beforeEach(() => (concurrentRun = new ConcurrentRun()));

  afterEach(() => jest.clearAllMocks());

  it('should create new EventEmitter in init', () => {
    expect(concurrentRun._emitter).toBeInstanceOf(EventEmitter);
  });

  describe('run', () => {
    it("should fail to run if commands parameter isn't array", () => {
      invalidCommands.forEach(command => expect(() => concurrentRun.run(command)).toThrow());
    });

    it('should fail to run if commands array is empty', () => {
      expect(() => concurrentRun.run([])).toThrow();
    });

    it('should fail to run if some command is not a string or an empty string', () => {
      invalidCommands.forEach(command => expect(() => concurrentRun.run([command])).toThrow());
    });

    it('should spawn a new process', () => {
      process.env = { jest: true };
      const spawnOptions = { shell: true, env: { FORCE_COLOR: 1, ...process.env } };

      concurrentRun.run(['command']);
      expect(child_process.spawn).toHaveBeenCalledWith('command', [], spawnOptions);
      expect(child_process.spawn).toHaveBeenCalledTimes(1);
      child_process.spawn.mockClear();

      concurrentRun.run(['command arg']);
      expect(child_process.spawn).toHaveBeenCalledWith('command', ['arg'], spawnOptions);
      expect(child_process.spawn).toHaveBeenCalledTimes(1);
      child_process.spawn.mockClear();

      concurrentRun.run(['command1 arg1', 'command2 arg2']);
      expect(child_process.spawn.mock.calls[0]).toEqual(['command1', ['arg1'], spawnOptions]);
      expect(child_process.spawn.mock.calls[1]).toEqual(['command2', ['arg2'], spawnOptions]);
      expect(child_process.spawn).toHaveBeenCalledTimes(2);
    });

    it('should emit on stderr data event', done => {
      concurrentRun.on('data', (data, command, index) => {
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

    it('should emit on stdout data event', done => {
      concurrentRun.on('data', (data, command, index) => {
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

    it('should emit on close event', done => {
      concurrentRun.on('close', (exitCode, command, index) => {
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

    it('should emit on error event', done => {
      concurrentRun.on('error', (err, command, index) => {
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

  it('should add listener and execute it on specific event', done => {
    const onSpy = jest.spyOn(concurrentRun._emitter, 'on');

    concurrentRun.on('data', done);

    const onCall = onSpy.mock.calls[0];
    expect(onCall[0]).toBe('data');
    expect(typeof onCall[1]).toBe('function');

    concurrentRun._emitter.emit('data');
  });

  it('should remove listener from specific event', () => {
    const fn = jest.fn();
    const offSpy = jest.spyOn(concurrentRun._emitter, 'off');

    concurrentRun.on('close', fn);
    concurrentRun.off('close', fn);

    const offCall = offSpy.mock.calls[0];
    expect(offCall[0]).toBe('close');
    expect(typeof offCall[1]).toBe('function');

    concurrentRun._emitter.emit('close');
    expect(fn).not.toHaveBeenCalled();
  });

  it('should add listener and execute it only once on specific event', () => {
    const fn = jest.fn();
    const onceSpy = jest.spyOn(concurrentRun._emitter, 'once');

    concurrentRun.once('error', fn);

    const onceCall = onceSpy.mock.calls[0];
    expect(onceCall[0]).toBe('error');
    expect(typeof onceCall[1]).toBe('function');

    concurrentRun._emitter.emit('error');
    expect(() => concurrentRun._emitter.emit('error')).toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should return itself on every function call', () => {
    expect(concurrentRun.run(['command'])).toEqual(concurrentRun);
    expect(concurrentRun.on('data', jest.fn())).toEqual(concurrentRun);
    expect(concurrentRun.off('data', jest.fn())).toEqual(concurrentRun);
    expect(concurrentRun.once('error', jest.fn())).toEqual(concurrentRun);
  });
});
