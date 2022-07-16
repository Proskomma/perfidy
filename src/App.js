import React, {useState} from 'react';

import StepSpec from "./components/StepSpec";
import stepTemplates from "./lib/stepTemplates";

import './App.css';

function App() {
    const [specSteps, setSpecSteps] = useState([]);
    const [nextStepId, setNextStepId] = useState(1);
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="program-title"><img className="logo" src={"favicon.ico"} alt="Perfidy Logo"/>Perfidy</h1>
            </header>
            <div className="content">
                <div className="spec-pane">
                    <div className="spec-inner">
                        <h2 className="spec-title">Spec
                            <button
                                className="add-step-button"
                                onClick={
                                    () => {
                                        setSpecSteps(
                                            [
                                                ...specSteps,
                                                {
                                                    id: nextStepId,
                                                    title: `New Step ${nextStepId}`,
                                                    ...stepTemplates.Source.local
                                                }
                                            ]
                                        );
                                        setNextStepId(nextStepId + 1);
                                    }
                                }
                            >
                                +
                            </button>
                        </h2>
                        {
                            specSteps.map(
                                (ss, n) =>
                                    <StepSpec
                                        key={n}
                                        spec={ss}
                                        deleteCallback={
                                            deleteId => setSpecSteps(specSteps.filter(v => v.id !== deleteId))
                                        }
                                        updateCallback = {
                                            newSpec => {
                                                const newTemplate =
                                                    stepTemplates[newSpec.type][newSpec.type === "Source" ? (newSpec.sourceLocation || 'local') : (newSpec.inputType || 'text')];
                                                for (const key of Object.keys(newSpec)) {
                                                    if (!['id', 'title'].includes(key) && !Object.keys(newTemplate).includes(key)) {
                                                        delete newSpec[key];
                                                    }
                                                }
                                                for (const key of Object.keys(newTemplate)) {
                                                    if (!Object.keys(newSpec).includes(key)) {
                                                        newSpec.key = newTemplate.key;
                                                    }
                                                }
                                                setSpecSteps(specSteps.map(v => v.id === newSpec.id ? newSpec : v));
                                            }
                                        }
                                    />
                            )
                        }
                    </div>
                </div>
                <div className="result-pane">
                    <div className="result-inner">
                        <h2 className="result-title">Result</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
