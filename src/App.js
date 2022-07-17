import React, {useState} from 'react';

import StepSpec from "./components/StepSpec";
import stepTemplates from "./lib/stepTemplates";
import DisplayResult from "./components/DisplayResult";

import './App.css';

function App() {
    const [specSteps, setSpecSteps] = useState([]);
    const [nextStepId, setNextStepId] = useState(1);
    const [results, setResults] = useState([]);
    const [runIssues, setRunIssues] = useState([]);

    const addStepCallback = () => {
        setSpecSteps(
            [
                ...specSteps,
                {
                    id: nextStepId,
                    title: `Source ${nextStepId}`,
                    ...stepTemplates.Source.local
                }
            ]
        );
        setNextStepId(nextStepId + 1);
    }

    const updateCallback = newSpec => {
        const newTemplate =
            stepTemplates[newSpec.type][newSpec.type === "Source" ?
                (newSpec.sourceLocation || 'local') :
                (newSpec.inputType || 'text')];
        for (const key of Object.keys(newSpec)) {
            if (!['id', 'title'].includes(key) && !Object.keys(newTemplate).includes(key)) {
                delete newSpec[key];
            }
        }
        for (const key of Object.keys(newTemplate)) {
            if (!Object.keys(newSpec).includes(key)) {
                newSpec[key] = newTemplate[key];
            }
        }
        setSpecSteps(specSteps.map(v => v.id === newSpec.id ? newSpec : v));
    }

    const deleteCallback = deleteId => setSpecSteps(specSteps.filter(v => v.id !== deleteId));

    const runCallback = () => {
        let newRunIssues = [];
        let displays = [];
        let unsatisfiedInputs = new Set([]);
        for (const specStep of [...specSteps].reverse()) {
            if (specStep.type === 'Display') {
                displays.unshift({
                    id: specStep.id,
                    inputType: specStep.inputType,
                    inputSource: specStep.inputSource,
                    value: null
                });
                unsatisfiedInputs.add(specStep.inputSource);
            } else if (specStep.type === 'Source') {
                if (unsatisfiedInputs.has(`Source ${specStep.id}`)) {
                    for (const display of displays.filter(d => d.inputSource === `Source ${specStep.id}`)) {
                        if (display.inputType !== specStep.outputType) {
                            newRunIssues.push(`Source '${specStep.id}' is of wrong type for Display '${display.id}' (${specStep.outputType} vs ${display.inputType})`);
                            continue;
                        }
                        if (specStep.outputType === 'json') {
                            try {
                                display.value = JSON.parse(specStep.localValue);
                            } catch (err) {
                                newRunIssues.push(`Source '${specStep.id}' outputs JSON but does not contain valid JSON`);
                            }
                        } else {
                            display.value = specStep.localValue;
                        }
                    }
                    unsatisfiedInputs.delete(`Source ${specStep.id}`);
                } else {
                    newRunIssues.push(`Source '${specStep.id}' is unused`)
                }
            }
        }
        setResults(displays);
        setRunIssues([...newRunIssues]);
    }

    const clearResultsCallback = () => {
        setResults([]);
        setRunIssues([]);
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1 className="program-title"><img className="logo" src={"favicon.ico"} alt="Perfidy Logo"/>Perfidy</h1>
            </header>
            <div className="content">
                <div className="spec-pane">
                    <div className="spec-inner">
                        <h2 className="spec-title">
                            Spec
                            {" "}
                            <button
                                className="add-step-button"
                                onClick={addStepCallback}
                            >
                                +
                            </button>
                            <button
                                className="show-spec-button"
                                onClick={
                                    () => {
                                        console.log(JSON.stringify(specSteps, null, 2));
                                        alert(JSON.stringify(specSteps, null, 2));
                                    }
                                }
                            >
                                {"{}"}
                            </button>
                        </h2>
                        {
                            specSteps.map(
                                (ss, n) =>
                                    <StepSpec
                                        key={n}
                                        spec={ss}
                                        deleteCallback={deleteCallback}
                                        updateCallback={updateCallback}
                                    />
                            )
                        }
                    </div>
                </div>
                <div className="result-pane">
                    <div className="result-inner">
                        <h2 className="result-title">
                            <button
                                className="run-button"
                                onClick={runCallback}
                            >
                                >>
                            </button>
                            {"Result "}
                            <button
                                className="clear-results-button"
                                onClick={clearResultsCallback}
                            >
                                X
                            </button>
                        </h2>
                        {results.map((r, n) => <DisplayResult key={n} result={r}/>)}
                        {
                            runIssues.length > 0 &&
                            <div className="run-issues">
                                {runIssues.map((ri, n) => <p key={n}>{ri}</p>)}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
