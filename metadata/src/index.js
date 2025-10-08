import 'source-map-support/register.js';
import * as github from '@actions/github'
import * as core from '@actions/core';

async function main() {
  try {
    const token = core.getInput('token', { required: true });

    const context = github.context;
    core.setOutput("owner", context.payload.repository.owner.login);
    core.setOutput("owner-lower-case", context.payload.repository.owner.login.toLowerCase());
    core.setOutput("repository", context.payload.repository.name);
    core.setOutput("repository-lower-case", context.payload.repository.name.toLowerCase());
    
    core.debug(JSON.stringify(context, null, 2));

    let ref = context.ref;
    let sha = context.sha;

    if (context.payload.issue) {
      if (token === '') {
        core.setFailed('No GitHub token provided');
        return;
      }
      const octokit = github.getOctokit(token);

      const request = {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        pull_number: context.payload.issue.number
      }
      const result = await octokit.rest.pulls.get(request);
      console.log(JSON.stringify(result.data, null, 2));

      core.setOutput("issue-pull-request", JSON.stringify(result.data, null, 2));
      ref = result.data.head.ref;
      sha = result.data.head.sha;
    } else {
      core.setOutput("issue-pull-request", "{}");
    }

    if (context.payload.pull_request) {
      ref = context.payload.pull_request.head.ref;
      sha = context.payload.pull_request.head.sha;
    }

    core.setOutput("ref", ref);
    core.setOutput("sha", sha);

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
