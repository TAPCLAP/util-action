import 'source-map-support/register.js';
import * as core from '@actions/core';
import { parse as yamlParse} from 'yaml';
import WorkflowRunner from './workflowrunner.js';

async function main() {
  try {
    const token = core.getInput('github_token', { required: true });
    const workflowsYaml = core.getInput('workflows', { required: true });
    let failOnError = core.getInput('fail-on-error');
    failOnError = failOnError === 'true';
    let wait = core.getInput('wait');
    wait = wait === 'true';

    const workflows = yamlParse(workflowsYaml);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    const ref = process.env.GITHUB_REF;

    const workflowRunner = new WorkflowRunner(token);
    if (wait) {
      const conclusions = await workflowRunner.triggerMultipleWorkflowsWait(workflows, owner, repo, ref);
      if (failOnError && conclusions.filter(c => c.conclusion === 'failure').length > 0) {
        throw new Error('One or more workflows failed');
      }
    } else {
      await workflowRunner.triggerMultipleWorkflows(workflows, owner, repo, ref);
    }
   

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
