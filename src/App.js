import React, {useState} from 'react';
import {useProskomma} from 'proskomma-react-hooks';
import deepCopy from 'deep-copy-all';

import StepSpec from "./components/StepSpec";
import stepTemplates from "./lib/stepTemplates";
import runCallback from "./lib/runCallback";
import DisplayResult from "./components/DisplayResult";
import DisplayIssues from "./components/DisplayIssues";

import './App.css';

function App() {
    const [specSteps, setSpecSteps] = useState([]);
    const [nextStepId, setNextStepId] = useState(1);
    const [results, setResults] = useState([]);
    const [runIssues, setRunIssues] = useState([]);
    const [expandSpecs, setExpandSpecs] = useState(true);

    const {proskomma} = useProskomma({verbose: false});

    const cleanSteps = steps => {
        const ret = deepCopy(steps);
        for (const step of ret) {
            delete step.value;
            delete step.result;
            if (step.inputs) {
                step.inputs.forEach(i => delete i.value);
            }
        }
        return ret;
    }

    const defaultTemplate = stepType => {
        if (stepType === "Source") {
            return stepTemplates.Source.local;
        } else if (stepType === "Transform") {
            return stepTemplates.Transform.usfm2perf;
        } else {
            return stepTemplates.Display.text;
        }
    }

    const addStepCallback = stepType => {
        setSpecSteps(
            [
                ...specSteps,
                {
                    id: nextStepId,
                    title: `${stepType} ${nextStepId}`,
                    ...defaultTemplate(stepType)
                }
            ]
        );
        setNextStepId(nextStepId + 1);
    }

    const updateCallback = newSpec => {
        const newSpecSubtypes = {
            Source: newSpec.sourceLocation || 'local',
            Transform: newSpec.name || 'usfm2perf',
            Display: newSpec.inputType || 'text',
        }
        const newTemplate =
            stepTemplates[newSpec.type][newSpecSubtypes[newSpec.type]];
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

    const clearResultsCallback = () => {
        setResults([]);
        setRunIssues([]);
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1 className="program-title">
                    <img className="logo" src={"favicon.ico"} alt="Perfidy Logo"/>
                    {'Perfidy '}
                    <span className="smaller-program-title"> - an IDE for PERF</span>
                </h1>
            </header>
            <div className="content">
                <div className="spec-pane">
                    <div className="spec-inner">
                        <h2 className="spec-title">
                            Spec
                            {" "}
                            <button
                                className="add-step-button"
                                onClick={() => addStepCallback('Display')}
                            >
                                +D
                            </button>
                            <button
                                className="add-step-button"
                                onClick={() => addStepCallback('Transform')}
                            >
                                +T
                            </button>
                            <button
                                className="add-step-button"
                                onClick={() => addStepCallback('Source')}
                            >
                                +S
                            </button>
                            <button
                                className="show-spec-button"
                                onClick={
                                    () => {
                                        const clean = cleanSteps(specSteps);
                                        console.log(JSON.stringify(clean, null, 2));
                                        alert(JSON.stringify(clean, null, 2));
                                    }
                                }
                            >
                                {"{}"}
                            </button>
                            <button
                                className="show-spec-button"
                                onClick={
                                    () => setExpandSpecs(!expandSpecs)
                                }
                            >
                                {expandSpecs ? "><" : "<>"}
                            </button>
                        </h2>
                        {
                            specSteps.map(
                                (ss, n) =>
                                    <StepSpec
                                        key={n}
                                        spec={ss}
                                        expand={expandSpecs}
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
                                onClick={() => runCallback({
                                    specSteps,
                                    setResults,
                                    setRunIssues,
                                    proskomma
                                })}
                                disabled={results.length > 0 || runIssues.length > 0}
                            >
                                >>
                            </button>
                            {"Result "}
                            <button
                                className="clear-results-button"
                                onClick={clearResultsCallback}
                                disabled={results.length === 0 && runIssues.length === 0}
                            >
                                X
                            </button>
                        </h2>
                        {
                            runIssues.length > 0 &&
                            <DisplayIssues issues={runIssues} />
                        }
                        {
                            runIssues.length === 0 &&
                            results.map(
                                (r, n) =>
                                    <DisplayResult key={n} result={r}/>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
