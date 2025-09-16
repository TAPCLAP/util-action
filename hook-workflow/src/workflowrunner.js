import * as github from '@actions/github'
import * as core from '@actions/core';

const statusIcons = {
  success: "✅",
  failure: "❌",
  cancelled: "⚪",
};

function checkWorkflow(workflow) {
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
  return { workflowId, inputs };
}

export default class WorkflowRunner {
  constructor(authToken) {
    this.octokit = github.getOctokit(authToken);
  }

  async triggerWorkflow({ owner, repo, workflowId, ref, inputs }) {
    await this.octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
      inputs
    });
  }

  async triggerWorkflowRun({ owner, repo, workflowId, ref, inputs }) {
    const triggerTime = new Date().toISOString().split(".")[0] + "Z";

    await this.octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref,
      inputs
    });

    let runId;
    for (let i = 0; i < 20; i++) {

      console.log(`Search workflow with params: ${JSON.stringify({
        owner,
        repo,
        workflow_id: workflowId,
        event: 'workflow_dispatch',
        actor: 'github-actions[bot]',
        per_page: 1,
        created: `>=${triggerTime}`
      }, null, 2)}`);

      const { data } = await this.octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflowId,
        event: 'workflow_dispatch',
        actor: 'github-actions[bot]',
        per_page: 1,
        created: `>=${triggerTime}`
      });

      if (data.workflow_runs.length > 0) {
        runId = data.workflow_runs[0].id;
        break;
      }
      await new Promise(r => setTimeout(r, 5000));
    }

    if (!runId) throw new Error(`Failed to get run_id for workflow ${workflowId}`);
    return {
      workflowId: workflowId,
      runId: runId
    };
  }

  async waitWorkflow(runId, workflowId, owner, repo, pollInterval = 10000) {
    while (true) {
      console.log(`Waiting for workflow run: ${workflowId}/${runId}`);
      const { data } = await this.octokit.rest.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId
      });

      if (data.status === "completed") {
        return {
          workflowId: workflowId,
          conclusion: data.conclusion
        };
      }
      await new Promise(r => setTimeout(r, pollInterval));
    }
  }

  async triggerMultipleWorkflows(workflows, owner, repo, ref) {
    workflows.map(async (workflow) =>  {
        const { workflowId, inputs } = checkWorkflow(workflow);
        core.info(`Try trigger workflow: ${workflowId}, ref: ${ref}, inputs: ${JSON.stringify(inputs)}`);
        await this.triggerWorkflow({ owner, repo, workflowId, ref, inputs });
        core.info(`Triggered workflow: ${workflowId}, ref: ${ref}`);
    });
  }

  async triggerMultipleWorkflowsWait(workflows, owner, repo, ref) {
    const runIdPromises = workflows.map((wf) => {
      const { workflowId, inputs } = checkWorkflow(wf);
      return this.triggerWorkflowRun({ owner, repo, workflowId, ref, inputs });
    });
    const workflowRuns = await Promise.all(runIdPromises);

    console.log("All workflow run:", workflowRuns);

    const conclusions = await Promise.all(workflowRuns.map(run => this.waitWorkflow(run.runId, run.workflowId, owner, repo)));

    console.log("All workflow completed. Statuses:", JSON.stringify(conclusions, null, 2));

    const repoUrl = `https://github.com/${owner}/${repo}`;

    const rows = workflowRuns.map((run, i) => {
      const url = `${repoUrl}/actions/runs/${run.runId}`;
      const status = conclusions.find(c => c.workflowId === run.workflowId)?.conclusion;
      return [
        `<a href="${url}">${run.workflowId}</a>`,
        `${statusIcons[status]} <code>${status}</code>`
      ];
    });

    await core.summary
      .addHeading("Workflow hook statuses")
      .addTable([
        [{ data: "Run", header: true }, { data: "Status", header: true }],
        ...rows
      ])
      .write();

    return conclusions;
  }
}