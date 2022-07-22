import React from 'react';
import ReactJson from 'react-json-view';

function DisplayResult({result}) {

    const renderValue = r => {
        if (result.value === null || result.value === undefined) {
            return <span className="no-value">NO VALUE</span>
        }
        if (typeof result.value !== 'string') {
            return <ReactJson src={result.value} theme="monokai" collapsed={2}/>;
        } else if (result.value.length > 1024) {
            return result.value.slice(0, 1024) + ` ... [${result.value.length} bytes]`;
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
            <span className=" result-button tooltip">
                                <span className="tooltiptext ltooltiptext">Save Result to File</span>
            <button
                className="result-button"
                onClick={
                    () => {
                        const a = document.createElement('a');
                        a.download = `myResult.${typeof result.value === 'string' ? 'txt' : 'json'}`;
                        const blob = new Blob(
                            [typeof result.value === 'string' ? result.value : JSON.stringify(result.value, null, 2)],
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
                {"R>"}
            </button>
            </span>
        </div>
        <div className="display-result-value">
            {renderValue(result)}
        </div>
    </div>
}

export default DisplayResult;
