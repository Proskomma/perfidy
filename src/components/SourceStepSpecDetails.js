import React from "react";

function SourceStepSpecDetails({spec, updateCallback}) {
    return <>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`sourceLocation-${spec.id}`}>Source Location</label>
            <select
                name={`sourceLocation-${spec.id}`}
                onChange={
                    e => {
                        const newSpec = {
                            ...spec,
                            sourceLocation: e.target.value
                        }
                        if (newSpec.sourceLocation === 'local') {
                            newSpec.localValue = "";
                        } else {
                            newSpec.httpUrl = "";
                        }
                        updateCallback(newSpec);
                    }
                }
                defaultValue={spec.sourceLocation}
            >
                {
                    ['local', 'http'].map((op, n) => <option key={n} value={op}>{op}</option>)
                }
            </select>
        </div>
        {
            spec.sourceLocation === 'local' &&
            <div className="step-spec-field">
                <label className="step-spec-field-label" htmlFor={`localValue-${spec.id}`}>Value</label>
                <textarea
                    name={`localValue-${spec.id}`}
                    onChange={
                        e => {
                            const newSpec = {
                                ...spec,
                                localValue: e.target.value || ""
                            }
                            updateCallback(newSpec)
                        }
                    }
                    defaultValue={spec.localValue}
                />
            </div>
        }
        {
            spec.sourceLocation === 'http' &&
            <div className="step-spec-field">
                <label className="step-spec-field-label" htmlFor={`httpUrl-${spec.id}`}>URL</label>
                <input
                    name={`httpUrl-${spec.id}`}
                    onChange={
                        e => {
                            const newSpec = {
                                ...spec,
                                httpUrl: e.target.value || ""
                            }
                            updateCallback(newSpec)
                        }
                    }
                    value={spec.localValue}
                />
            </div>
        }
    </>
}

export default SourceStepSpecDetails;
