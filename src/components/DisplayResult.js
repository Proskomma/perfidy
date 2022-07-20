import React from 'react';
import ReactJson from 'react-json-view';

function DisplayResult({result}) {

    const renderValue = r => {
        if (result.value === null || result.value === undefined) {
            return <span className="no-value">NO VALUE</span>
        }
        if (typeof result.value !== 'string') {
            // return <pre>{JSON.stringify(result.value, null, 2)}</pre>;
            return <ReactJson src={result.value} theme="monokai"/>;
        } else if (result.value.length > 256) {
            return result.value.slice(0, 256) + ` ... [${result.value.length} bytes]`;
        } else {
            return result.value;
        }
    }

    const renderTitle = r => {
        let ret = `Display ${result.id}`;
        if (r.title !== ret) {
            ret = `${r.title} (#${result.id})`;
        }
        return ret;
    }

    return <div className="display-result">
        <div className="display-result-id">
            {renderTitle(result)}
        </div>
        <div className="display-result-value">
            <div>{renderValue(result)}</div>
        </div>
    </div>
}

export default DisplayResult;
