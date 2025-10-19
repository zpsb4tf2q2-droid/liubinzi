#!/usr/bin/env node
const { spawn } = require('node:child_process');

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    p.on('close', (code) => resolve(code ?? 1));
  });
}

(async () => {
  // Start DB if available
  await run('node', ['scripts/db-control.js', 'start']);

  // Build the Next.js app once so playwright can use `pnpm start`
  const buildCode = await run('pnpm', ['build']);
  if (buildCode !== 0) {
    await run('node', ['scripts/db-control.js', 'stop']);
    process.exit(buildCode);
  }

  // Run Playwright tests
  const e2eCode = await run('playwright', ['test']);

  // Stop DB
  await run('node', ['scripts/db-control.js', 'stop']);

  process.exit(e2eCode);
})();
