import 'source-map-support/register.js';
import * as core from '@actions/core';
import { execSync } from 'child_process';
import path from 'path';

const DRIVE_LETTERS = ['Z', 'Y', 'W', 'V', 'U', 'T', 'S', 'R', 'Q', 'P', 'O', 'N'];

function isWindows() {
  return process.platform === 'win32';
}

function trySubst(letter, workdir) {
  try {
    execSync(`subst ${letter}: "${workdir}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    if (!isWindows()) {
      core.info('Windows runner not detected. Skipping subst setup.');
      return;
    }

    const inputWorkdir = core.getInput('workdir') || process.env.GITHUB_WORKSPACE || process.cwd();
    const workdir = path.resolve(inputWorkdir);

    let volume = '';
    for (const letter of DRIVE_LETTERS) {
      if (trySubst(letter, workdir)) {
        volume = letter;
        break;
      }
    }

    if (!volume) {
      throw new Error('Failed to allocate subst drive');
    }

    const mappedWorkdir = `${volume}:/`;

    core.saveState('volume', volume);
    core.setOutput('volume', volume);
    core.setOutput('workdir', mappedWorkdir);

    core.exportVariable('VOLUME', volume);
    core.exportVariable('WORKDIR', mappedWorkdir);

    core.info(`Allocated subst drive ${volume}: -> ${workdir}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
