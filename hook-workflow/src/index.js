import 'source-map-support/register.js';
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
      let workflowId = workflow;
      let inputs = {};
      if (typeof workflow === 'object') {
        if (workflow.hasOwnProperty('name')) {
          workflowId = workflow.name
        } else {
          throw new Error(`Workflow ${JSON.stringify(workflow)} must have a name property`);
        }
        if (workflow.hasOwnProperty('inputs')) {
          inputs = workflow.inputs;
        }
      }
      if (typeof workflowId !== 'string') {
        throw new Error(`Workflow ${JSON.stringify(workflowId)} must be a string, got: ${typeof workflowId}`);
      }

      core.info(`Try trigger workflow: ${workflowId}, ref: ${ref}, inputs: ${JSON.stringify(inputs)}`);
      await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs
      });
      core.info(`Triggered workflow: ${workflowId}, ref: ${ref}`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
