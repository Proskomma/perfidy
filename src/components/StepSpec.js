import React from 'react';

import SourceStepSpecDetails from "./SourceStepSpecDetails";

function StepSpec({spec, deleteCallback, updateCallback}) {
    return <div className="step-spec">
        <div className="step-spec-id">
            {spec.id}
            <button
                className="delete-step-button"
                onClick={() => deleteCallback(spec.id)}
            >
                x
            </button>
        </div>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`title-${spec.id}`}>Title</label>
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
        </div>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`type-${spec.id}`}>Type</label>
            <select
                name={`type-${spec.id}`}
                onChange={
                    e => {
                        spec.type = e.target.value;
                        updateCallback(spec)
                    }
                }
                defaultValue={spec.type}
            >
                {
                    ['Source', 'Transform', 'Display'].map((op, n) => <option key={n} value={op}>{op}</option>)
                }
            </select>
        </div>
        {
            spec.type === "Source"
            &&
            <SourceStepSpecDetails
                spec={spec}
                updateCallback={updateCallback}
            />
        }
        {spec.type === "Transform" && <p>TRANSFORM</p>}
        {spec.type === "Display" && <p>DISPLAY</p>}
    </div>
}

export default StepSpec;