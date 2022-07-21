import React, {useState} from 'react';

import SourceStepSpecDetails from "./SourceStepSpecDetails";
import DisplayStepSpecDetails from "./DisplayStepSpecDetails";
import TransformStepSpecDetails from "./TransformStepSpecDetails";

function StepSpec({spec, deleteCallback, updateCallback, expand}) {

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
            <span onClick={() => setHasFocus(!hasFocus)}>
                {spec.type}
                {" Step => "}
                {renderTitle(spec)}
            </span>
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
