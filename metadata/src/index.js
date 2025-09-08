import 'source-map-support/register.js';
import * as github from '@actions/github'
import * as core from '@actions/core';

async function main() {
  try {
    const context = github.context;
    core.setOutput("owner", context.payload.repository.owner.login);
    core.setOutput("owner-lower-case", context.payload.repository.owner.login.toLowerCase());
    core.setOutput("repository", context.payload.repository.name);
    core.setOutput("repository-lower-case", context.payload.repository.name.toLowerCase());

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
