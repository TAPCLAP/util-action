import 'source-map-support/register.js';
import * as core from '@actions/core';
import { execSync } from 'child_process';

function isWindows() {
  return process.platform === 'win32';
}

async function main() {
  try {
    if (!isWindows()) {
      core.info('Windows runner not detected. Skipping subst cleanup.');
      return;
    }

    const volume = core.getState('volume') || process.env.VOLUME || '';
    if (!volume) {
      core.info('No subst drive to cleanup.');
      return;
    }

    execSync(`subst ${volume}: /d`, { stdio: 'ignore' });
    core.info(`Removed subst drive ${volume}:`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
