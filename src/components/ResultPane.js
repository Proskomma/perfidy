import React, { useState } from "react";
import { useProskomma } from "proskomma-react-hooks";
import runCallback from "../lib/runCallback";
import DisplayIssues from "./DisplayIssues";
import EditorWrapper from "./EditorWrapper";

export function ResultPane({ specSteps }) {
  const { proskomma } = useProskomma({ verbose: false });
  const [results, setResults] = useState([]);
  const [runIssues, setRunIssues] = useState([]);
  const clearResultsCallback = () => {
    setResults([]);
    setRunIssues([]);
  };

  return (
    <div className="result-inner">
      <h2 className="result-title">
        <span className=" run-button tooltip">
          <span className="tooltiptext rtooltiptext">Run the steps</span>
          <button
            className="run-button"
            onClick={() => runCallback({
              specSteps: specSteps,
              setResults: setResults,
              setRunIssues: setRunIssues,
              proskomma: proskomma,
            })}
            disabled={results.length > 0 || runIssues.length > 0}
          >
            {">>"}
          </button>
        </span>
        <span className="tooltip">
          <span className="tooltiptext rtooltiptext">
            See the Results of your Pipeline Here
          </span>
          {"Result "}
        </span>
        <span className=" clear-results-button tooltip">
          <span className="tooltiptext ltooltiptext">Delete the results</span>
          <button
            className="clear-results-button"
            onClick={clearResultsCallback}
            disabled={results.length === 0 && runIssues.length === 0}
          >
            X
          </button>
        </span>
      </h2>
      {runIssues.length > 0 && <DisplayIssues issues={runIssues} />}
      {runIssues.length === 0 && (
        <EditorWrapper results={results} />
      )}
    </div>
  );
}
