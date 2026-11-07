import bcrypt from 'bcryptjs';
import { stdin, stdout } from 'node:process';

if (!stdin.isTTY) {
  console.error('Run this command in an interactive terminal: npm run hash-password');
  process.exit(1);
}

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    let value = '';
    stdout.write(label);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\u0003') {
          cleanup();
          reject(new Error('Cancelled.'));
          return;
        }
        if (char === '\r' || char === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ' && char <= '~') value += char;
      }
    };
    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
    };
    stdin.on('data', onData);
  });
}

try {
  const password = await hiddenPrompt('Choose an admin password (12+ characters; input hidden): ');
  if (password.length < 12) throw new Error('Use at least 12 characters.');
  if (Buffer.byteLength(password, 'utf8') > 72) throw new Error('Use no more than 72 UTF-8 bytes because bcrypt cannot safely distinguish longer passwords.');
  const confirmation = await hiddenPrompt('Confirm admin password: ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  const hash = await bcrypt.hash(password, 12);
  console.log('\nSet ADMIN_PASSWORD_HASH in your private .env to this value:\n');
  console.log(hash);
} catch (err) {
  console.error(`\n${err.message}`);
  process.exitCode = 1;
}
