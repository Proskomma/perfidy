import React, {useState} from 'react';
import {useProskomma} from 'proskomma-react-hooks';

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

    const {proskomma} = useProskomma({verbose: true});

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
                                onClick={() => runCallback({
                                    specSteps,
                                    setResults,
                                    setRunIssues,
                                    proskomma
                                })}
                                disabled={results.length > 0}
                            >
                                >>
                            </button>
                            {"Result "}
                            <button
                                className="clear-results-button"
                                onClick={clearResultsCallback}
                                disabled={results.length === 0}
                            >
                                X
                            </button>
                        </h2>
                        {
                            runIssues.length > 0 &&
                            <DisplayIssues issues={runIssues} />
                        }
                        {
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
