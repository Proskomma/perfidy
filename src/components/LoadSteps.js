// Based on https://bobbyhadz.com/blog/react-open-file-input-on-button-click
import {useRef} from 'react';

import stepTemplates from "../lib/stepTemplates";

function LoadSteps({setSpecSteps}) {

    const inputRef = useRef(null);

    const handleClick = () => {
        // 👇️ open file input box on click of other element
        inputRef.current.click();
    };

    const handleFileChange = event => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }

        // console.log('fileObj is', fileObj);

        // 👇️ reset file input
        event.target.value = null;

        // Check if the file is an image.
        if (fileObj.type && !fileObj.type === 'application/json') {
            console.log('Not a JSON file', fileObj.type, fileObj);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const loadedJson = JSON.parse(event.target.result);
            loadedJson
                .filter(st => st.type === "Transform")
                .forEach(st => st.code = stepTemplates.Transform[st.name].code);
            setSpecSteps(loadedJson);
        });
        reader.readAsText(fileObj);

    };

    return (
        <span className="spec-button">
            <input
                style={{display: 'none'}}
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
            />

            <button  className="spec-button" onClick={handleClick}>{">P"}</button>
        </span>
    );
}

export default LoadSteps;
