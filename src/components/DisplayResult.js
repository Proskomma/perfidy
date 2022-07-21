import React, {useState} from 'react';
import ReactJson from 'react-json-view';

import TextWindow from "./TextWindow";

function DisplayResult({result}) {

    const [displayTextWindow, setDisplayTextWindow] = useState(false);

    const renderValue = r => {
        if (result.value === null || result.value === undefined) {
            return <span className="no-value">NO VALUE</span>
        }
        if (typeof result.value !== 'string') {
            return <ReactJson src={result.value} theme="monokai"/>;
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
            <button
                className="open-result-button"
                onClick={()=> setDisplayTextWindow(!displayTextWindow)}
                disabled={typeof result.value !== 'string'}
            >
                ^
            </button>
        </div>
        <div className="display-result-value">
            {renderValue(result)}
        </div>
        {
            displayTextWindow &&
            typeof result.value === 'string' &&
            <TextWindow
                title={result.title}
            >
                <h1>{result.title}</h1>
                {result.value.split(/[\n\r]/).map((l, n) => <pre key={n}>{l}</pre>)}
            </TextWindow>
        }
    </div>
}

export default DisplayResult;
