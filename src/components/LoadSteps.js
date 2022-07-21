// Based on https://bobbyhadz.com/blog/react-open-file-input-on-button-click
import {useRef} from 'react';

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
            setSpecSteps(JSON.parse(event.target.result));
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
