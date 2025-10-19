#!/usr/bin/env node
const { execSync } = require('node:child_process');

function hasDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

const action = process.argv[2];

if (!hasDocker()) {
  console.log('[db-control] Docker not available, skipping DB', action || '');
  process.exit(0);
}

try {
  if (action === 'start') {
    console.log('[db-control] Starting database (docker compose up -d db)');
    run('docker compose up -d db');
  } else if (action === 'stop') {
    console.log('[db-control] Stopping database (docker compose stop db)');
    run('docker compose stop db');
  } else {
    console.log('Usage: node scripts/db-control.js <start|stop>');
    process.exit(1);
  }
} catch (err) {
  console.error('[db-control] Error:', err.message || err);
  process.exit(1);
}
