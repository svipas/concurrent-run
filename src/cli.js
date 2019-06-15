#!/usr/bin/env node

const os = require('os');
const { ConcurrentRun } = require('./concurrentRun');
const { color } = require('./color');

const argv = process.argv.slice(2);
if (argv.length === 0) {
  logError('Usage: concurrent-run "command1 arg1" "command2 arg2"');
  process.exit(1);
}

try {
  console.log();

  const executedCommands = {};
  new ConcurrentRun()
    .run(argv)
    .on('data', (data, command, index) => {
      command = getUniqueCommand(command, index);
      if (!executedCommands[command]) {
        executedCommands[command] = [data];
      } else {
        executedCommands[command].push(data);
      }
    })
    .on('close', (exitCode, command, index) => {
      const executedCommand = executedCommands[getUniqueCommand(command, index)];
      if (executedCommand) {
        executedCommand.forEach(data => {
          const lines = data.toString().split(os.EOL);
          lines.forEach(line => {
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
      }

      const exitMsg = color.bold(`[${index}] ${command} exited with ${exitCode}`);
      console.log(exitCode === 0 ? color.green(exitMsg) : color.red(exitMsg));
      console.log();

      if (exitCode !== 0) {
        process.exitCode = exitCode;
      }
    })
    .on('error', (err, command) => {
      logError(`${color.grey(color.bold(`[${command}]`))} ${err.toString()}`);
      process.exit(1);
    });
} catch (err) {
  logError(err.message);
  process.exit(1);
}

function logError(text) {
  console.log(`${color.red('error')} ${text}`);
}

function getUniqueCommand(command, index) {
  return `[${index}] ${command}`;
}
