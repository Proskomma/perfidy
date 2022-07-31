import React, { useState } from "react";
import { useProskomma } from "proskomma-react-hooks";
import runCallback from "../lib/runCallback";
import DisplayIssues from "./DisplayIssues";
import EditorWrapper from "./EditorWrapper";
import { Box, Button, Tooltip } from "@mui/material";

export function ResultPane({ specSteps }) {
  const { proskomma } = useProskomma({ verbose: false });
  const [results, setResults] = useState([]);
  const [runIssues, setRunIssues] = useState([]);
  const clearResultsCallback = () => {
    setResults([]);
    setRunIssues([]);
  };

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <Box>
        <Box>
          <Tooltip title={`Run the steps`}>
            <Button
              onClick={() =>
                runCallback({
                  specSteps: specSteps,
                  setResults: setResults,
                  setRunIssues: setRunIssues,
                  proskomma: proskomma,
                })
              }
            >
              {">>"}
            </Button>
          </Tooltip>

          <Tooltip title={`Delete the results`}>
            <Button
              onClick={clearResultsCallback}
              disabled={results.length === 0 && runIssues.length === 0}
            >
              {"X"}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {runIssues.length > 0 && <DisplayIssues issues={runIssues} />}
      {runIssues.length === 0 && <EditorWrapper results={results} />}
    </Box>
  );
}
