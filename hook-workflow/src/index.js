import * as core from '@actions/core';
import * as github from '@actions/github'
import { parse as yamlParse} from 'yaml';


async function main() {
  try {
    const token = core.getInput('github_token', { required: true });
    const workflowsYaml = core.getInput('workflows', { required: true });
    const workflows = yamlParse(workflowsYaml);
    const octokit = github.getOctokit(token);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const ref = process.env.GITHUB_REF;

    for (const workflow of workflows) {
      await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflow,
        ref
      });
      
      core.info(`Triggered workflow: ${workflow}, ref: ${ref}`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
