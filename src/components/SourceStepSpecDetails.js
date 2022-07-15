import React from "react";

function SourceStepSpecDetails({spec, updateCallback}) {
    return <>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`sourceLocation-${spec.id}`}>Source Location</label>
            <select
                name={`sourceLocation-${spec.id}`}
                onChange={
                    e => {
                        spec.sourceLocation = e.target.value;
                        if (spec.sourceLocation === 'local') {
                            delete spec.httpUrl;
                        } else {
                            delete spec.localValue;
                        }
                        updateCallback(spec)
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
                            spec.localValue = e.target.value;
                            updateCallback(spec)
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
                            spec.httpUrl = e.target.value;
                            updateCallback(spec)
                        }
                    }
                    value={spec.localValue}
                />
            </div>
        }
    </>
}

export default SourceStepSpecDetails;
