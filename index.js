const child_process = require('child_process');

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.log('Expected more than 0 arguments!');
  process.exit(1);
}

argv.forEach((fullArg) => {
  if (!fullArg) {
    return;
  }

  const splittedArg = fullArg.split(' ');
  const arg = splittedArg[0];
  const args = splittedArg.slice(1);

  const command = child_process.spawn(arg, args, { stdio: 'inherit', shell: process.env.SHELL });
  command.on('close', (code) => {
    console.log(`${fullArg} exited with code ${code}`);

    if (code !== 0) {
      process.exitCode = code;
    }
  });
});
