import 'source-map-support/register.js';
import * as core from '@actions/core';
import { parse as yamlParse} from 'yaml';


async function main() {
  try {
    const inputsText = core.getInput('inputs', { required: true });
    const mappingText = core.getInput('mapping', { required: true });

    const inputs = yamlParse(inputsText);
    const mapping = yamlParse(mappingText);

    const result = [];
    for (const k in inputs) {
      if (mapping.hasOwnProperty(k) && inputs[k] === true) {
        if (!Array.isArray(mapping[k])) {
          throw new Error(`"mapping[${k}]" must be array`);
        }
        result.push(...mapping[k]);
      }
    }

    core.setOutput('mapped', JSON.stringify(result));

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
