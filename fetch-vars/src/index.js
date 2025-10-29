import 'source-map-support/register.js';
import * as core from '@actions/core';
// import * as github from '@actions/github'
import { parse as yamlParse} from 'yaml';


async function main() {
  try {
    const varsText = core.getInput('vars', { required: true });
    const fetchText = core.getInput('fetch', { required: true });
    const defaultsText = core.getInput('defaults', { required: false });

    const vars = yamlParse(varsText);
    const fetch = yamlParse(fetchText);
    const defaults = yamlParse(defaultsText);

    for (const i of fetch) {
      if (!i.hasOwnProperty('from') || !i.hasOwnProperty('to')) {
        throw new Error(`Invalid fetch item. "from" and "to" are required: ${JSON.stringify(i)}`);
      }
      const from = i.from;
      const to = i.to;

      if (vars[from]) {
        core.info(`Fetching '${from}' to '${to}': '${vars[from]}'`);
        core.info(`Setting output '${to}': '${vars[from]}'`);
        core.setOutput(to, vars[from]);
      } else {
        if (!defaults) { continue; }
        let defaultValue = defaults.find(d => d.name === to)
        if (!defaultValue) {
          throw new Error(`Not found var '${from}' and no default for '${to}'`);
        }
      }
    }

    if (!defaults) {
      return;
    }

    for (const d of defaults) {
      if (!d.hasOwnProperty('name') || !d.hasOwnProperty('value')) {
        throw new Error(`Invalid default item. "name" and "value" are required: ${JSON.stringify(d)}`);
      }
      if (!vars[d.name]) {
        core.info(`Setting output '${d.name}': '${d.value}'`);
        core.setOutput(d.name, d.value);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
