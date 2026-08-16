const { spawn } = require('child_process');

const password = 'lims_update_pass_2026\n';

const child = spawn('npx.cmd', ['tauri', 'signer', 'generate', '-w', 'lims.key', '-f'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('password to protect')) {
    child.stdin.write(password);
  }
  if (output.includes('Password (one more time):')) {
    child.stdin.write(password);
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});
