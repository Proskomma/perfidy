import React from "react";

function DisplayStepSpecDetails({spec, updateCallback}) {
    return <>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`inputType-${spec.id}`}>Input Type</label>
            <select
                name={`inputType-${spec.id}`}
                onChange={
                    e => {
                        const newSpec = {
                            ...spec,
                            inputType: e.target.value
                        }
                        updateCallback(newSpec);
                    }
                }
                defaultValue={spec.inputType}
            >
                {
                    ['text', 'json'].map((op, n) => <option key={n} value={op}>{op}</option>)
                }
            </select>
        </div>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`inputSource-${spec.id}`}>Input Source</label>
            <input
                name={`inputSource-${spec.id}`}
                onChange={
                    e => {
                        const newSpec = {
                            ...spec,
                            inputSource: e.target.value
                        }
                        updateCallback(newSpec);
                    }
                }
                defaultValue={spec.inputSource}
            />
        </div>
    </>
}

export default DisplayStepSpecDetails;
