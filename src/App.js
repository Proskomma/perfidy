import React, { useState} from 'react';
import {useProskomma} from 'proskomma-react-hooks';
import deepCopy from 'deep-copy-all';
import StepSpec from "./components/StepSpec";
import stepTemplates from "./lib/stepTemplates";
import runCallback from "./lib/runCallback";
// import DisplayResult from "./components/DisplayResult";
import DisplayIssues from "./components/DisplayIssues";
import LoadSteps from "./components/LoadSteps";
import Tooltip from '@mui/material/Tooltip';
import SaveIcon from '@mui/icons-material/Save';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';

import './App.css';
import EditorWrapper from './components/EditorWrapper';

function App() {
    const [specSteps, setSpecSteps] = useState([]);
    const [nextStepId, setNextStepId] = useState(1);
    const [results, setResults] = useState([]);
    const [runIssues, setRunIssues] = useState([]);
    const [expandSpecs, setExpandSpecs] = useState(true);
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    

    const { proskomma } = useProskomma({ verbose: false });

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
        delete newSpec.description;
        for (const key of Object.keys(newTemplate)) {
            if (!Object.keys(newSpec).includes(key)) {
                newSpec[key] = newTemplate[key];
            }
        }
        setSpecSteps(specSteps.map(v => v.id === newSpec.id ? newSpec : v));
    }

    const moveCallback = (specPosition, direction) => {
        let specs = [...specSteps];
        specs.splice(specPosition, 1);
        if (direction === "up") {
            specs.splice(specPosition - 1, 0, specSteps[specPosition]);
        } else {
            specs.splice(specPosition + 1, 0, specSteps[specPosition]);
        }
        setSpecSteps(specs);
    }

    const deleteCallback = deleteId => setSpecSteps(specSteps.filter(v => v.id !== deleteId));

    const clearResultsCallback = () => {
        setResults([]);
        setRunIssues([]);
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };
    
    const handleCloses = () => {
        setAnchorEl(null);
      };
    
    const opens = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className="App">
            <header className="App-header">
                <h1 className="program-title">
                    <span className="tooltip">
                        <span className="tooltiptext rtooltiptext">Logo, ready for First PERF World Dev Conference</span>
                            <img className="logo" src={"favicon.ico"} alt="Perfidy Logo"/>
                        </span>
                        <span className="tooltip">
                            <span className="tooltiptext rtooltiptext">The state of being deceitful and untrustworthy</span>
                                {'Perfidy '}
                            </span>
                        <span className="tooltip">
                            <span
                              className="tooltiptext rtooltiptext"
                            >
                            It's called Perfidy because... oh never mind
                            </span>
                        <span className="smaller-program-title"> - an IDE for PERF</span>
                    </span>
                </h1>
            </header>
            <div className="content">
                <div className="spec-pane">
                    <div className="spec-inner">
                        <h2 className="spec-title">
                            <span className="tooltip">
                            <span className="tooltiptext rtooltiptext">Build your Pipeline Here</span>
                                {"Spec "}
                            </span>
                            <Tooltip title="Add Display,Transform and Source steps" placement="bottom" arrow>
                            <button aria-describedby={id} className="add-step-button" onClick={handleClick}>
                            <AddIcon/>
                            </button>
                            </Tooltip>
                            <Popover
                              id={id}
                              open={opens}
                              anchorEl={anchorEl}
                              onClose={handleCloses}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                            >
                                <MenuItem value={10} onClick={() => addStepCallback('Display')}>Display</MenuItem>
                                <MenuItem value={20} onClick={() => addStepCallback('Transform')}>Transform</MenuItem>
                                <MenuItem value={30} onClick={() => addStepCallback('Source')}>Source</MenuItem>
                            </Popover>
                            <LoadSteps
                                setSpecSteps={setSpecSteps}
                                setNextStepId={setNextStepId}
                            />
                            <Tooltip title="Save Steps to File" placement="bottom" arrow>
                            <button
                                size="small"
                                variant='contained'
                                className="spec-button"
                                onClick={
                                    () => {
                                        const a = document.createElement('a');
                                        a.download = 'mySpecSteps.json';
                                        const blob = new Blob(
                                            [JSON.stringify(
                                                cleanSteps(specSteps),
                                                null,
                                                2
                                            )
                                            ],
                                            {type: 'application/json'}
                                        );
                                        a.href = URL.createObjectURL(blob);
                                        a.addEventListener('click', (e) => {
                                            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
                                        });
                                        a.click();
                                    }
                                }
                            >
                                <SaveIcon/>
                                {/* SAVE */}
                            </button>
                            </Tooltip>
                            <Tooltip title="Expand All Steps" placement="bottom" arrow>
                            <button
                                size="small"
                                variant='contained'
                                className="spec-button"
                                onClick={
                                    () => setExpandSpecs(!expandSpecs)
                                }
                            >
                                {expandSpecs ? <UnfoldLessIcon/> : <UnfoldMoreIcon/>}
                            </button>
                            </Tooltip>
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
                                        moveCallback={moveCallback}
                                        position={n}
                                        nSteps={specSteps.length}
                                    />
                            )
                        }
                    </div>
                </div>
                <div className="result-pane">
                    <div className="result-inner">
                        <h2 className="result-title">
                            <span className=" run-button tooltip">
                            <Tooltip title="Run the steps" placement="bottom" arrow>
                            <button
                                size="small"
                                variant='contained'
                                className="run-button"
                                onClick={() => runCallback({
                                    specSteps,
                                    setResults,
                                    setRunIssues,
                                    proskomma
                                })}
                                disabled={results.length > 0 || runIssues.length > 0}
                            >
                                <PlayArrowIcon/>
                            </button>
                            </Tooltip>
                            </span>
                            <span className="tooltip">
                                <span className="tooltiptext rtooltiptext">See the Results of your Pipeline Here</span>
                                {"Result "}
                            </span>
                            <span className=" clear-results-button tooltip">
                            <Tooltip title="Delete the results" placement="bottom" arrow>
                            <button
                                className="clear-results-button"
                                onClick={clearResultsCallback}
                                disabled={results.length === 0 && runIssues.length === 0}
                            >
                                <CloseIcon/>
                            </button>
                            </Tooltip>
                            </span>
                        </h2>
                        {
                            runIssues.length > 0 &&
                            <DisplayIssues issues={runIssues} />
                        }
                        {
                            runIssues.length === 0 && 
                            <EditorWrapper results={results} />
                        }
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
