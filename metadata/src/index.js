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
    
    if(core.isDebug()) {
      console.log(JSON.stringify(context, null, 2));
    }

    let prData      = {};
    let headRef     = context.ref;
    let headSha     = context.sha;
    let headRefName = normalizeRefName(context.ref);
    let mergeRef    = context.ref;
    let mergeSha    = context.sha;

    if (context.payload.issue && context.payload.issue.pull_request) {
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

      prData      = result.data;
      headRefName = result.data.head.ref;
      headRef     = `refs/heads/${headRefName}`;
      headSha     = result.data.head.sha;
      mergeRef    = `refs/pull/${context.payload.issue.number}/merge`;
      mergeSha    = result.data.merge_commit_sha;

    }

    if (context.payload.pull_request) {
      prData      = context.payload.pull_request;
      headRefName = context.payload.pull_request.head.ref;
      headRef     = `refs/heads/${headRefName}`;
      headSha     = context.payload.pull_request.head.sha;
      mergeRef    = `refs/pull/${context.payload.pull_request.number}/merge`;
      mergeSha    = context.payload.pull_request.merge_commit_sha;
    }

    prData = JSON.stringify(prData, null, 2);
    core.setOutput("head-ref", headRef);
    core.setOutput("head-ref-name", headRefName);
    core.setOutput("head-sha", headSha);
    core.setOutput("merge-ref", mergeRef);
    core.setOutput("merge-sha", mergeSha);
    core.setOutput("pull-request", prData);

    core.setOutput("all", JSON.stringify({
      "head-ref": headRef,
      "head-ref-name": headRefName,
      "head-sha": headSha,
      "merge-ref": mergeRef,
      "merge-sha": mergeSha,
      "pull-request": prData,
      "owner": context.payload.repository.owner.login,
      "repository": context.payload.repository.name,
      "owner-lower-case": context.payload.repository.owner.login.toLowerCase(),
      "repository-lower-case": context.payload.repository.name.toLowerCase(),
    }, null, 2));

  } catch (error) {
    core.setFailed(error.message);
  }
}


function normalizeRefName(str) {
  if (str.includes('/')) {
    const parts = str.split('/');
    return parts.pop(); 
  }
  return str;
}

main();
