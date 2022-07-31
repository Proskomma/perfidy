import React, { useState } from 'react';

import SourceStepSpecDetails from "./SourceStepSpecDetails";
import DisplayStepSpecDetails from "./DisplayStepSpecDetails";
import TransformStepSpecDetails from "./TransformStepSpecDetails";
import { Box, Card, CardContent, CardHeader, IconButton, InputBase, TextField, Tooltip, Typography } from '@mui/material';
import ClearIcon from "@mui/icons-material/Clear";
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

function StepSpec({ spec, deleteCallback, updateCallback, moveCallback, expand, position, nSteps }) {

    const [hasFocus, setHasFocus] = useState(false);

    const renderTitle = sp => {
        let ret = `${spec.type} ${sp.id}`;
        if (sp.title !== ret) {
            ret = `${sp.title} (#${sp.id})`;
        }
        return ret;
    }

    return (
      <Card
        className={`step-spec${
          expand || hasFocus ? "" : " step-spec-collapsed"
        }`}
        sx={{ flexGrow: 1 }}
      >
        {!expand && !hasFocus && (
          <>
            <div className="collapsed-button-left tooltip">
              <span className="tooltiptext rtooltiptext">Move Step Up</span>
              <button
                className="collapsed-button-left"
                disabled={position === 0}
                onClick={() => moveCallback(position, "up")}
              >
                ^
              </button>
            </div>
            <div className="collapsed-button-left tooltip">
              <span className="tooltiptext rtooltiptext">Move Step Down</span>
              <button
                className="collapsed-button-left"
                disabled={position === nSteps - 1}
                onClick={() => moveCallback(position, "down")}
              >
                v
              </button>
            </div>
            {spec.type}
            {": "}
            {renderTitle(spec)}
            <div className="collapsed-button-right tooltip">
              <span className="tooltiptext ltooltiptext">Delete this Step</span>
              <button
                className="collapsed-button-right"
                onClick={() => deleteCallback(spec.id)}
              >
                x
              </button>
            </div>
            <div className="collapsed-button-right tooltip">
              <span className="tooltiptext ltooltiptext">Expand this Step</span>
              <button
                className="collapsed-button-right"
                onClick={() => setHasFocus(!hasFocus)}
              >
                …
              </button>
            </div>
          </>
        )}
        {(expand || hasFocus) && (
          <>
            <CardHeader
              action={
                <>
                  <Tooltip title="Delete Step">
                    <IconButton
                      size={"small"}
                      onClick={() => deleteCallback(spec.id)}
                    >
                      <ClearIcon fontSize="inherit"></ClearIcon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Collapse Step">
                    <IconButton
                      size={"small"}
                      onClick={() => setHasFocus(false)}
                    >
                      <UnfoldLessIcon fontSize="inherit"></UnfoldLessIcon>
                    </IconButton>
                  </Tooltip>
                </>
              }
              title={
                <Typography variant="subtitle1">{`${spec.type} ${spec.id}`}</Typography>
              }
              subheader={
                (
                  <InputBase
                    sx={{
                      color: (theme) => theme.palette.text.secondary,
                      width: "100%",
                    }}
                    placeholder="enter step title"
                    variant="outlined"
                    name={`title-${spec.id}`}
                    type="text"
                    value={spec.title !== `${spec.type} ${spec.id}` ? spec.title : ""}
                    onChange={(e) => {
                      spec.title = e.target.value;
                      updateCallback(spec);
                    }}
                    autoFocus
                  />
                ) || undefined
              }
            />
            <CardContent className="step-spec-id">
              {spec.type === "Source" && (
                <SourceStepSpecDetails
                  spec={spec}
                  updateCallback={updateCallback}
                />
              )}
              {spec.type === "Display" && (
                <DisplayStepSpecDetails
                  spec={spec}
                  updateCallback={updateCallback}
                />
              )}
              {spec.type === "Transform" && (
                <TransformStepSpecDetails
                  spec={spec}
                  updateCallback={updateCallback}
                />
              )}
            </CardContent>
          </>
        )}
      </Card>
    );
}

export default StepSpec;
