import { IconButton, Tooltip } from '@mui/material';
import React from 'react'
import deepCopy from "deep-copy-all";
import DownloadIcon from "@mui/icons-material/Download";

function SaveStepsButton({ steps }) {

    const cleanSteps = (steps) => {
      const ret = deepCopy(steps);
      for (const step of ret) {
        delete step.value;
        delete step.result;
        if (step.inputs) {
          step.inputs.forEach((i) => delete i.value);
        }
      }
      return ret;
    };
  
  const  saveSteps= () => {
    const a = document.createElement("a");
    a.download = "mySpecSteps.json";
    const blob = new Blob([JSON.stringify(cleanSteps(steps), null, 2)], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", (e) => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  };

  return (
    <Tooltip title="Save Steps to File">
      <IconButton size={"small"} onClick={saveSteps}>
        <DownloadIcon fontSize="inherit"></DownloadIcon>
      </IconButton>
    </Tooltip>
  );
}

export default SaveStepsButton