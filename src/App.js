import React, {useState,useCallback} from 'react';
import {useProskomma} from 'proskomma-react-hooks';
import deepCopy from 'deep-copy-all';
import StepSpec from "./components/StepSpec";
import stepTemplates from "./lib/stepTemplates";
import runCallback from "./lib/runCallback";
// import DisplayResult from "./components/DisplayResult";
import DisplayIssues from "./components/DisplayIssues";
import LoadSteps from "./components/LoadSteps";
import ReactFlow, {
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';

import './App.css';
import EditorWrapper from './components/EditorWrapper';

const graphStyles = { width: "100%", height: "500px" };

function App() {
    const [specSteps, setSpecSteps] = useState([]);
    const [nextStepId, setNextStepId] = useState(1);
    const [results, setResults] = useState([]);
    const [runIssues, setRunIssues] = useState([]);
    const [expandSpecs, setExpandSpecs] = useState(true);
    const [showGraph, setShowGraph] = useState(false)
    const [flowInstance,setFlowInstance] = useState({})

    const { proskomma } = useProskomma({ verbose: false });

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const onInit = (reactFlowInstance) => {
        // console.log('flow loaded:', reactFlowInstance);
        setFlowInstance(reactFlowInstance)
    }

    const setNodeAndSpecStep = (specs) => {
        setSpecSteps(specs)
        const stepY = 60;
        let sourceY = 0;
        let transformY = 0;
        let outputY = 0;
        let position = {};
        const mappedNodes = specs.map( step => {
            let sourcePosition = undefined;
            let targetPosition = undefined;
            let type = undefined;
            let draggable = true;
            let colorStr = "";
            if (step.type==='Source') {
                sourcePosition = 'right';
                type = 'input';
                draggable = false;
                position = { x: 0, y: (sourceY * stepY) };
                sourceY++;
                colorStr = 'green';
            } else if (step.type==='Display') {
                targetPosition = 'left';
                type = 'output';
                position = { x: 500, y: (outputY * stepY) };
                outputY++;
                colorStr = 'blue';
            } else {
                sourcePosition = 'right';
                targetPosition = 'left';
                position = { x: 250, y: (transformY * stepY) };
                transformY++;
                colorStr = 'red';
            }
            return {
                ...step,
                sourcePosition,
                targetPosition,
                data: { label: step.title },
                id: step.id.toString(),
                draggable,
                position,
                type,
                style: { border: `2px solid ${colorStr}`, padding: 10 },
            }
        })
        setNodes(mappedNodes)
        const mappedEdges = []
        specs.forEach( step => {
            const target = step.id.toString();
            step.inputs && step.inputs.forEach( i => {
                const srcIdStr = i.source.match(/\d+/)
                const findNode = mappedNodes.filter(n => n.id === srcIdStr[0])
                if (findNode[0]) {
                    const source = findNode[0].id.toString()
                    mappedEdges.push({
                        id: `e${target}-${source}`,
                        source,
                        target
                    })
                }
            })
            if (step.inputSource) {
                const srcIdStr = step.inputSource.match(/\d+/)
                const findNode = mappedNodes.filter(n => n.id === srcIdStr[0])
                if (findNode[0]) {
                    const source = findNode[0].id.toString()
                    mappedEdges.push({
                        id: `e${target}-${source}`,
                        source,
                        target
                    })
                }
            }
        })
        setEdges(mappedEdges)
        flowInstance.zoomIn()
        flowInstance.fitView()
    }

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
        setNodeAndSpecStep(
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

        setNodeAndSpecStep(specSteps.map(v => v.id === newSpec.id ? newSpec : v));
    }

    const moveCallback = (specPosition, direction) => {
        let specs = [...specSteps];
        specs.splice(specPosition, 1);
        if (direction === "up") {
            specs.splice(specPosition - 1, 0, specSteps[specPosition]);
        } else {
            specs.splice(specPosition + 1, 0, specSteps[specPosition]);
        }

        setNodeAndSpecStep(specs);
    }

    const deleteCallback = deleteId => setNodeAndSpecStep(specSteps.filter(v => v.id !== deleteId));

    const clearResultsCallback = () => {
        setResults([]);
        setRunIssues([]);
    }

     return (
        <div className="App">
            <header className="App-header">
                <h1 className="program-title">
                    <span className="tooltip">
                        <span className="tooltiptext rtooltiptext">Logo, ready for First PERF World Dev Conference</span>
                        <img className="logo" src={"favicon.ico"} alt="Perfidy Logo" />
                    </span>
                    <span className="tooltip">
                        <span className="tooltiptext rtooltiptext">The state of being deceitful and untrustworthy</span>
                        {'Perfidy '}
                    </span>
                    <span className="tooltip">
                        <span
                            className="tooltiptext rtooltiptext">It's called Perfidy because... oh never mind</span>
                        <span className="smaller-program-title"> - an IDE for PERF</span>
                    </span>
                    {showGraph &&
                        <button
                            className="opened-graph-button"
                            onClick={
                                () => setShowGraph(false)
                            }
                        >
                            X
                        </button>
                    }
                </h1>
            </header>
            <div className="content">
                <div className={showGraph ? "graph-pane" : "graph-pane-hidden"}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={onInit}
                        panOnDrag={true}
                        zoomOnScroll={false}
                        panOnScroll={false}
                        zoomOnDoubleClick={false}
                        style={graphStyles}
                        onNodeClick={(event, element) => {
    // To do: might add interactivity features here
    //                      console.log("click", element);
                        }}
                        fitView
                    >
                        <Background color="#aaa" gap={16} />
                    </ReactFlow>
                </div>
                {!showGraph &&
                <>
                    <div className="spec-pane">
                        <div className="spec-inner">
                            <h2 className="spec-title">
                            <span className="tooltip">
                                <span className="tooltiptext rtooltiptext">Build your Pipeline Here</span>
                                {"Spec "}
                            </span>
                                <span className=" add-step-button tooltip">
                                <span className="tooltiptext ltooltiptext">Add a Display Step</span>
                                <button
                                    className="add-step-button"
                                    onClick={() => addStepCallback('Display')}
                                >
                                    +D
                                </button>
                            </span>
                                <span className=" add-step-button tooltip">
                                <span className="tooltiptext ltooltiptext">Add a Transform Step</span>
                                <button
                                    className="add-step-button"
                                    onClick={() => addStepCallback('Transform')}
                                >
                                    +T
                                </button>
                            </span>
                                <span className=" add-step-button tooltip">
                                <span className="tooltiptext ltooltiptext">Add a Source Step</span>
                                <button
                                    className="add-step-button"
                                    onClick={() => addStepCallback('Source')}
                                >
                                    +S
                                </button>
                            </span>
                                <span className=" spec-button tooltip">
                                <span className="tooltiptext rtooltiptext">Load Steps from File</span>
                                <LoadSteps
                                    setSpecSteps={setNodeAndSpecStep}
                                    setNextStepId={setNextStepId}
                                />
                            </span>
                                <span className=" spec-button tooltip">
                                <span className="tooltiptext rtooltiptext">Save Steps to File</span>
                                <button
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
                                    {"P>"}
                                </button>
                            </span>
                                <span className=" spec-button tooltip">
                                <span className="tooltiptext rtooltiptext">Expand All Steps</span>
                                <button
                                    className="spec-button"
                                    onClick={
                                        () => setExpandSpecs(!expandSpecs)
                                    }
                                >
                                    {expandSpecs ? "><" : "<>"}
                                </button>
                            </span>
                                {(nodes && nodes.length > 0) && (
                                    <span className="graph-button tooltip">
                            <span className="tooltiptext rtooltiptext">Graph view</span>
                            <button
                                className="graph-button"
                                onClick={
                                    () => setShowGraph(!showGraph)
                                }
                            >
                                {showGraph ? "[L]" : "[G]"}
                            </button>
                        </span>
                                )}
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
                                <span className="tooltiptext rtooltiptext">Run the steps</span>
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
                                    {">>"}
                                </button>
                            </span>
                                <span className="tooltip">
                                <span className="tooltiptext rtooltiptext">See the Results of your Pipeline Here</span>
                                    {"Result "}
                            </span>
                                <span className=" clear-results-button tooltip">
                                <span className="tooltiptext ltooltiptext">Delete the results</span>
                                <button
                                    className="clear-results-button"
                                    onClick={clearResultsCallback}
                                    disabled={results.length === 0 && runIssues.length === 0}
                                >
                                    X
                                </button>
                            </span>
                            </h2>
                            {
                                runIssues.length > 0 &&
                                <DisplayIssues issues={runIssues}/>
                            }
                            {
                                runIssues.length === 0 &&
                                <EditorWrapper results={results}/>
                            }

                        </div>
                    </div>
                </>
                }
            </div>
        </div>
    );
}

export default App;
