import 'source-map-support/register';
import * as github from '@actions/github'
import * as core from '@actions/core';
import { parse as yamlParse} from 'yaml';

async function main() {
  try {
    const context  = github.context;
    const token    = core.getInput('token', { required: true });

    let info         = core.getInput('info', { required: true });
    let templateVars = core.getInput('template-vars', { required: false });
    let checkRun     = core.getInput('check-run', { required: false });

    templateVars = yamlParse(templateVars);
    info = template(info, templateVars);
    const startTime = new Date().toISOString();
  
    if ((context.payload.issue && context.payload.issue.pull_request) || context.payload.pull_request) {
      const octokit = github.getOctokit(token);
      const issueNumber = context.payload.issue ? context.payload.issue.number : context.payload.pull_request.number;
  
      await core.summary
        .addRaw(info)
        .write();

      const { data: comments } = await octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
      });

      const matchingComments = comments.filter(c => c.body === info);

      for (const comment of matchingComments) {
        await octokit.rest.issues.deleteComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: comment.id,
        });
      }

      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: info,
      });


      if (checkRun !== '') {
        let headSha = context.sha;

        if (context.payload.pull_request) {
          headSha = context.payload.pull_request.head.sha;
        }

        if (context.payload.issue && context.payload.issue.pull_request) {
          const result = await octokit.rest.pulls.get({
            owner: context.payload.repository.owner.login,
            repo: context.payload.repository.name,
            pull_number: context.payload.issue.number
          });

          headSha = result.data.head.sha;
        }

        const endTime = new Date().toISOString();

        await octokit.rest.checks.create({
          owner: context.repo.owner,
          repo: context.repo.repo,
          name: checkRun,
          head_sha: headSha,
          status: "completed",
          conclusion: "success",
          started_at: startTime,
          completed_at: endTime,
          output: {
            title: 'info about PR #' + issueNumber,
            summary: info,
          }
        });


      }

    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

function template(str, templateVars) {
  for (const [key, value] of Object.entries(templateVars)) {
    str = str.replaceAll(`{{ ${key} }}`, value);
  }
  return str;
}

main();
