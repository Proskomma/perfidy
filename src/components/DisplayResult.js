import React from 'react';
import ReactJson from 'react-json-view';

function DisplayResult({result}) {

    const renderValue = r => {
        if (result.value === null) {
            return <span className="no-value">NO VALUE</span>
        }
        if (typeof result.value !== 'string') {
            // return <pre>{JSON.stringify(result.value, null, 2)}</pre>;
            return <ReactJson src={result.value} theme="monokai"/>;
        } else {
            return result.value;
        }
    }

    return <div className="display-result">
        <div className="display-result-id">
            {"Display "}
            {result.id}
        </div>
        <div className="display-result-value">
            <div>{renderValue(result)}</div>
        </div>
    </div>
}

export default DisplayResult;
