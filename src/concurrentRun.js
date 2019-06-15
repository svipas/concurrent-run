const child_process = require('child_process');
const { EventEmitter } = require('events');

class ConcurrentRun {
  constructor() {
    this._emitter = new EventEmitter();
  }

  /**
   * @param commands {string[]}
   */
  run(commands) {
    if (!Array.isArray(commands)) {
      throw Error(`Expected type of commands parameter is array, received ${typeof commands}`);
    }
    if (commands.length === 0) {
      throw Error('Commands array is empty');
    }
    if (commands.some(command => typeof command !== 'string' || command.trim().length === 0)) {
      throw Error('Some command in the commands array is not a string or an empty string');
    }

    commands.forEach((command, index) => {
      const splittedCommand = command.split(' ');
      const arg = splittedCommand[0];
      const args = splittedCommand.slice(1);
      const executeCommand = child_process.spawn(arg, args, { env: { FORCE_COLOR: 1, ...process.env } });
      executeCommand.stderr.on('data', data => this._emitter.emit('data', data, command, index));
      executeCommand.stdout.on('data', data => this._emitter.emit('data', data, command, index));
      executeCommand.on('close', exitCode => this._emitter.emit('close', exitCode, command, index));
      executeCommand.on('error', err => this._emitter.emit('error', err, command, index));
    });

    return this;
  }

  /**
   * @param event {'data' | 'close' | 'error'}
   * @param listener {(data: Buffer, command: string, index: number) => void | (exitCode: number, command: string, index: string) => void | (err: Error, command: string, index: string) => void}
   */
  on(event, listener) {
    this._emitter.on(event, listener);
    return this;
  }

  /**
   * @param event {'data' | 'close' | 'error'}
   * @param listener {(data: Buffer, command: string, index: number) => void | (exitCode: number, command: string, index: string) => void | (err: Error, command: string, index: string) => void}
   */
  off(event, listener) {
    this._emitter.off(event, listener);
    return this;
  }

  /**
   * @param event {'data' | 'close' | 'error'}
   * @param listener {(data: Buffer, command: string, index: number) => void | (exitCode: number, command: string, index: string) => void | (err: Error, command: string, index: string) => void}
   */
  once(event, listener) {
    this._emitter.once(event, listener);
    return this;
  }
}

module.exports = { ConcurrentRun };
