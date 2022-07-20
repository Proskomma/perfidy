import Axios from "axios";

const runCallback = async ({specSteps, setResults, setRunIssues, proskomma}) => {
    let newRunIssues = [];
    let outputs = [];
    let transforms = [];
    let unsatisfiedInputs = new Set([]);
    if (specSteps.length === 0) {
        newRunIssues.push('No spec steps specified!');
    } else {
        await checkSpec({
            specSteps,
            outputs,
            newRunIssues,
            unsatisfiedInputs,
            transforms
        });
        evaluateSpec({
            specSteps,
            outputs,
            proskomma
        });
    }
    setResults(outputs);
    Array.from(unsatisfiedInputs).forEach(ui => newRunIssues.push(`Unsatisfied input ${ui}`));
    setRunIssues([...newRunIssues]);
}

const checkSpec = async ({specSteps, outputs, newRunIssues, unsatisfiedInputs}) => {
    console.log("\n** Check **");
    for (const specStep of [...specSteps].reverse()) {
        if (specStep.type === 'Display') {
            outputs.unshift({
                type: "Display",
                title: specStep.title,
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
            for (const input of specStep.inputs) {
                if (input.source.trim().length === 0) {
                    newRunIssues.push(`No input source specified for ${input.name} for Transform ${specStep.id}`)
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
                        console.log(`Fetching HTTP content for Source ${specStep.id}`);
                        const response = await Axios.get(specStep.httpUrl);
                        if (response.status !== 200) {
                            newRunIssues.push(`Status code ${response.status} when fetching content by HTTP(S) for Source ${specStep.id}`);
                            continue;
                        }
                        specStep.value = response.data;
                    } catch (err) {
                        newRunIssues.push(`Exception when fetching content by HTTP(S) for Source ${specStep.id}: ${err}`);
                        continue;
                    }
                } else {
                    specStep.value = specStep.localValue;
                }
                if (specStep.outputType === 'json') {
                    console.log(`Parsing JSON content for Source ${specStep.id}`);
                    try {
                        specStep.value = JSON.parse(specStep.value);
                    } catch (err) {
                        newRunIssues.push(`Source ${specStep.id} outputs JSON but does not contain valid JSON`);
                    }
                }
                for (const display of outputs.filter(d => d.inputSource === `Source ${specStep.id}`)) {
                    if (display.inputType !== specStep.outputType) {
                        newRunIssues.push(`Source ${specStep.id} is of wrong type for Display ${display.id} (${specStep.outputType} vs ${display.inputType})`);
                    }
                }
                unsatisfiedInputs.delete(`Source ${specStep.id}`);
            } else {
                newRunIssues.push(`Source ${specStep.id} is unused`)
            }
        }
    }
}

const evaluateSpec = ({specSteps, outputs, proskomma}) => {
    console.log("** Evaluate **");
    // Remove old values
    for (const transformStep of [...specSteps].filter(st => st.type === "Transform")) {
        for (const input of transformStep.inputs) {
            delete input.value;
        }
    }
    for (const display of outputs) {
        delete display.value;
    }
    // Copy source value to transforms and displays
    for (const sourceStep of [...specSteps].filter(st => st.type === "Source")) {
        for (const display of outputs.filter(d => d.inputSource === `Source ${sourceStep.id}`)) {
            console.log(`Linking Source ${sourceStep.id} output to Display ${display.id} input`);
            display.value = sourceStep.value;
        }
        for (const transformStep of [...specSteps].filter(st => st.type === "Transform")) {
            for (const input of transformStep.inputs) {
                if (input.source === `Source ${sourceStep.id}`) {
                    console.log(`Linking Source ${sourceStep.id} output to Transform ${transformStep.id} ${input.name} input`);
                    input.value = sourceStep.value;
                }
            }
            delete transformStep.result;
        }
    }
    // Propagate values between transforms until nothing changes
    let changed = true;
    while (changed) {
        changed = false;
        for (const transformStep of [...specSteps].filter(st => st.type === "Transform")) {
            if (transformStep.inputs.filter(i => !i.value).length === 0 && !transformStep.result) {
                console.log(`Evaluating Transform ${transformStep.id}`);
                const inputOb = {};
                for (const input of transformStep.inputs) {
                    inputOb[input.name] = input.value;
                }
                transformStep.result = transformStep.code({...inputOb, proskomma});
                for (const consumingTransform of [...specSteps].filter(st => st.type === "Transform")) {
                    for (const consumingInput of consumingTransform.inputs) {
                        for (const resolvedOutput of Object.keys(inputOb)) {
                            if (consumingInput.source === `Transform ${transformStep.id} ${resolvedOutput}`) {
                                console.log(`Linking Source ${transformStep.id} ${resolvedOutput} output to Transform ${consumingTransform.id} ${consumingInput.name} input`);
                                consumingInput.value = inputOb[resolvedOutput];
                            }
                        }
                    }
                }
                changed = true;
            }
        }
    }
    // Copy transform values to displays
    for (const transformStep of
        [...specSteps]
            .filter(st => st.type === "Transform")
            .filter(st => st.result)
        ) {
        for (const resultField of Object.keys(transformStep.result)) {
            const resultFieldOutputString = `Transform ${transformStep.id} ${resultField}`
            for (const display of outputs) {
                if (resultFieldOutputString === display.inputSource) {
                    console.log(`Copying ${resultFieldOutputString} to Display ${display.id}`)
                    display.value = transformStep.result[resultField];
                }
            }
        }

    }
    console.log("****");
}

export default runCallback;
