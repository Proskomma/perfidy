// Based on https://bobbyhadz.com/blog/react-open-file-input-on-button-click
import { IconButton, Tooltip } from '@mui/material';
import {useRef} from 'react';

import stepTemplates from "../lib/stepTemplates";
import UploadIcon from "@mui/icons-material/Upload";

function LoadStepsButton({setSpecSteps, setNextStepId}) {

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
                .forEach(
                    st => {
                        st.code = stepTemplates.Transform[st.name].code;
                        st.description = stepTemplates.Transform[st.name].description;
                    }
                );
            setSpecSteps(loadedJson);
            const lastId = Math.max(...loadedJson.map(st => parseInt(st.id)));
            setNextStepId(lastId + 1);
        });
        reader.readAsText(fileObj);

    };

    return (
      <>
        <input
          style={{ display: "none" }}
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
        />
        <Tooltip title="Load Steps from File">
          <IconButton size={"small"} onClick={handleClick}>
            <UploadIcon fontSize="inherit"></UploadIcon>
          </IconButton>
        </Tooltip>
      </>
    );
}

export default LoadStepsButton;
