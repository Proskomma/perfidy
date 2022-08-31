import React, {useState} from 'react';

import SourceStepSpecDetails from "./SourceStepSpecDetails";
import DisplayStepSpecDetails from "./DisplayStepSpecDetails";
import TransformStepSpecDetails from "./TransformStepSpecDetails";

function StepSpec({spec, deleteCallback, updateCallback, moveCallback, expand, position, nSteps}) {

    const [hasFocus, setHasFocus] = useState(false);

    const renderTitle = sp => {
        let ret = `${spec.type} ${sp.id}`;
        if (sp.title !== ret) {
            ret = `${sp.title} (#${sp.id})`;
        }
        return ret;
    }

    return <div
        className={`step-spec${(expand || hasFocus) ? "" : " step-spec-collapsed"}`}
    >
        {
            !expand &&
            !hasFocus &&
            <>
                <div className="collapsed-button-left tooltip">
                    <span className="tooltiptext rtooltiptext">Move Step Up</span>
                    <button
                        className="collapsed-button-left"
                        disabled={position === 0}
                        onClick={() => moveCallback(position, 'up')}
                    >
                        ^
                    </button>
                </div>
                <div className="collapsed-button-left tooltip">
                    <span className="tooltiptext rtooltiptext">Move Step Down</span>
                    <button
                        className="collapsed-button-left"
                        disabled={position === nSteps - 1}
                        onClick={() => moveCallback(position, 'down')}
                    >
                        v
                    </button>
                </div>
                {spec.type}
                {": "}
                {renderTitle(spec)}
                <div className="collapsed-button-right tooltip">
                    <span className="tooltiptext ltooltiptext">Delete this Step</span>
                    <button
                        className="collapsed-button-right"
                        onClick={() => deleteCallback(spec.id)}
                    >
                        x
                    </button>
                </div>
                <div className="collapsed-button-right tooltip">
                    <span className="tooltiptext ltooltiptext">Expand this Step</span>
                    <button
                        className="collapsed-button-right"
                        onClick={() => setHasFocus(!hasFocus)}
                    >
                        …
                    </button>
                </div>
            </>
        }
        {
            (expand || hasFocus) &&
            <>
                <div className="step-spec-id">
                    <label className="step-spec-field-label" htmlFor={`title-${spec.id}`}>
                        {spec.type}
                        {" "}
                        {spec.id}
                    </label>
                    <span>
                <input
                    name={`title-${spec.id}`}
                    type="text"
                    value={spec.title}
                    onChange={
                        e => {
                            spec.title = e.target.value;
                            updateCallback(spec)
                        }
                    }/>
            </span>
                    <span className="delete-step-button tooltip">
                                <span className="tooltiptext ltooltiptext">Delete Step</span>
                    <button
                        className="delete-step-button"
                        onClick={() => deleteCallback(spec.id)}
                    >
                        x
                    </button>
                    </span>
                    <span className="minimize-step-button tooltip">
                                <span className="tooltiptext ltooltiptext">Collapse Step</span>
                    <button
                        className="minimize-step-button"
                        onClick={() => setHasFocus(false)}
                        disabled={expand}
                    >
                        _
                    </button>
                    </span>
                </div>
                {
                    spec.type === "Source"
                    &&
                    <SourceStepSpecDetails
                        spec={spec}
                        updateCallback={updateCallback}
                    />
                }
                {
                    spec.type === "Display" &&
                    <DisplayStepSpecDetails
                        spec={spec}
                        updateCallback={updateCallback}
                    />
                }
                {
                    spec.type === "Transform" &&
                    <TransformStepSpecDetails
                        spec={spec}
                        updateCallback={updateCallback}
                    />
                }
            </>
        }
    </div>
}

export default StepSpec;
