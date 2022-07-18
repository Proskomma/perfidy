import Axios from "axios";

const runCallback = async ({specSteps, setResults, setRunIssues}) => {
    let newRunIssues = [];
    let outputs = [];
    let transforms = [];
    let unsatisfiedInputs = new Set([]);
    if (specSteps.length === 0) {
        newRunIssues.push('No spec steps specified!');
    }
    for (const specStep of [...specSteps].reverse()) {
        if (specStep.type === 'Display') {
            outputs.unshift({
                type: "Display",
                id: specStep.id,
                inputType: specStep.inputType,
                inputSource: specStep.inputSource.trim(),
                value: null
            });
            if (specStep.inputSource.trim().length === 0) {
                newRunIssues.push(`No input source specified for Display '${specStep.id}'`)
            } else {
                unsatisfiedInputs.add(specStep.inputSource.trim());
            }
        }
        if (specStep.type === 'Transform') {
            transforms.unshift({
                type: "Transform",
                id: specStep.id,
                inputs: specStep.inputs,
                value: null
            });
            for (const input of specStep.inputs) {
                if (input.source.trim().length === 0) {
                    newRunIssues.push(`No input source specified for ${input.source.trim()} for Transform '${specStep.id}'`)
                } else {
                    unsatisfiedInputs.add(`${input.source}`);
                }
            }
            for (const output of specStep.outputs) {
                unsatisfiedInputs.delete(`Transform ${specStep.id} ${output.name}`)
            }
        } else if (specStep.type === 'Source') {
            if (unsatisfiedInputs.has(`Source ${specStep.id}`)) {
                if (specStep.sourceLocation === 'http') {
                    try {
                        const response = await Axios.get(specStep.httpUrl);
                        if (response.status !== 200) {
                            newRunIssues.push(`Status code ${response.status} when fetching content by HTTP(S) for Source '${specStep.id}'`);
                            continue;
                        }
                        specStep.value = response.data;
                    } catch (err) {
                        newRunIssues.push(`Exception when fetching content by HTTP(S) for Source '${specStep.id}': ${err}`);
                        continue;
                    }
                } else {
                    specStep.value = specStep.localValue;
                }
                if (specStep.outputType === 'json') {
                    try {
                        specStep.value = JSON.parse(specStep.value);
                    } catch (err) {
                        newRunIssues.push(`Source '${specStep.id}' outputs JSON but does not contain valid JSON`);
                    }
                }
                // Move this to generic eval section
                for (const display of outputs.filter(d => d.inputSource === `Source ${specStep.id}`)) {
                    if (display.inputType !== specStep.outputType) {
                        newRunIssues.push(`Source '${specStep.id}' is of wrong type for Display '${display.id}' (${specStep.outputType} vs ${display.inputType})`);
                        continue;
                    }
                    display.value = specStep.value;
                }
                unsatisfiedInputs.delete(`Source ${specStep.id}`);
            } else {
                newRunIssues.push(`Source '${specStep.id}' is unused`)
            }
        }
    }
    setResults(outputs);
    Array.from(unsatisfiedInputs).forEach(ui => newRunIssues.push(`Unsatisfied input ${ui}`));
    setRunIssues([...newRunIssues]);
}

export default runCallback;
