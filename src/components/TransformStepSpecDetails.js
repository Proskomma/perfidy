import React from "react";
import stepTemplates from "../lib/stepTemplates";

function TransformStepSpecDetails({spec, updateCallback}) {
    return <>
        <div className="step-spec-field">
            <label className="step-spec-field-label" htmlFor={`transform-${spec.id}`}>Transform</label>
            <select
                name={`transform-${spec.id}`}
                onChange={
                    e => {
                        const newSpec = {...spec, ...stepTemplates["Transform"][e.target.value]};
                        updateCallback(newSpec);
                    }
                }
                defaultValue={spec.name}
            >
                {
                    Object.keys(stepTemplates["Transform"]).map((op, n) => <option key={n} value={op}>{op}</option>)
                }
            </select>
        </div>
        <div className="step-spec-field step-spec-field-heading">Input:</div>
        {
            spec.inputs.map(
                (i, n) =>
                    <div key={n} className="step-spec-field">
                        <label className="step-spec-field-label" htmlFor={`inputSource-${spec.id}-${n}`}>
                            {i.name}
                            {" ("}
                            {i.type}
                            {")"}
                        </label>
                        <input
                            name={`inputSource-${spec.id}- ${n}`}
                            onChange={
                                e => {
                                    const newSpec = {
                                        ...spec,
                                        inputs: spec.inputs.map((i2, n2) => n2 === n ? {
                                            ...i2,
                                            source: e.target.value
                                        } : i2),
                                    }
                                    updateCallback(newSpec);
                                }
                            }
                            defaultValue={i.source}
                        />
                    </div>
            )
        }
        <div className="step-spec-field-label" style={{fontWeight: "bold"}}>Output:</div>
        <div className="step-spec-field step-spec-field-text">
            {spec.outputs.map((o, n) => `${o.name} (${o.type})`).join(', ')}
        </div>
    </>
}

export default TransformStepSpecDetails;
