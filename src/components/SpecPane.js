import React, { useState } from "react";
import deepCopy from "deep-copy-all";
import StepSpec from "./StepSpec";
import stepTemplates from "../lib/stepTemplates";
import LoadSteps from "./LoadSteps";
import { Box, ButtonBase, Divider, List, ListSubheader, Stack, Tooltip, IconButton, ListItem, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

function ActionButton({ children, ...props }) {
    return (
        <ButtonBase
            variant="contained"
            size="small"
            sx={{
                fontSize: ".8rem",
                fontWeight: "bold",
                borderRadius: 0.5,
                p: 0.2,
                ":hover": {
                    bgcolor: "#ffffff1a",
                },
            }}
            {...props}
        >{children}</ButtonBase>
    );
}

const stepTypes = ["Source", "Transform", "Display"];

export function SpecPane({ setSpecSteps, specSteps }) {
    const [nextStepId, setNextStepId] = useState(1);
    const [expandSpecs, setExpandSpecs] = useState(true);

    const moveCallback = (specPosition, direction) => {
        let specs = [...specSteps];
        specs.splice(specPosition, 1);
        if (direction === "up") {
            specs.splice(specPosition - 1, 0, specSteps[specPosition]);
        } else {
            specs.splice(specPosition + 1, 0, specSteps[specPosition]);
        }
        setSpecSteps(specs);
    };

    const deleteCallback = (deleteId) => setSpecSteps((specSteps) => specSteps.filter((v) => v.id !== deleteId));


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


    const defaultTemplate = (stepType) => {
        if (stepType === "Source") {
            return stepTemplates.Source.local;
        } else if (stepType === "Transform") {
            return stepTemplates.Transform.usfm2perf;
        } else {
            return stepTemplates.Display.text;
        }
    };


    const addStepCallback = (stepType) => {
        setSpecSteps((specSteps) => [
            ...specSteps,
            {
                id: nextStepId,
                title: `${stepType} ${nextStepId}`,
                ...defaultTemplate(stepType),
            },
        ]);
        setNextStepId((nextStepId) => nextStepId + 1);
    };

    const updateCallback = (newSpec) => {
        const newSpecSubtypes = {
            Source: newSpec.sourceLocation || "local",
            Transform: newSpec.name || "usfm2perf",
            Display: newSpec.inputType || "text",
        };
        const newTemplate = stepTemplates[newSpec.type][newSpecSubtypes[newSpec.type]];
        for (const key of Object.keys(newSpec)) {
            if (!["id", "title"].includes(key) &&
                !Object.keys(newTemplate).includes(key)) {
                delete newSpec[key];
            }
        }
        delete newSpec.description;
        for (const key of Object.keys(newTemplate)) {
            if (!Object.keys(newSpec).includes(key)) {
                newSpec[key] = newTemplate[key];
            }
        }
        setSpecSteps((specSteps) => specSteps.map((v) => (v.id === newSpec.id ? newSpec : v))
        );
    };


    return (
        <Box sx={{ height: "100%", display: "grid", gridTemplateRows: "1fr 1fr auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.2rem 1rem",
          }}
        >
          <Tooltip title="Build your Pipeline Here">
            <Typography
              variant="button"
              sx={{
                color: (theme) => theme.palette.text.disabled,
                fontSize: "0.6rem",
              }}
            >
              Spec
            </Typography>
          </Tooltip>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="flex-end"
            spacing={0.3}
          >
            <Tooltip title="Save Steps to File">
              <IconButton size={"small"}>
                <DownloadIcon fontSize="inherit"></DownloadIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Load Steps from File">
              <IconButton size={"small"}>
                <UploadIcon fontSize="inherit"></UploadIcon>
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Divider></Divider>
        <List
          sx={{
            width: "100%",
            height: "100%",
          }}
          subheader={
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <Tooltip title="Build your Pipeline Here">
                <ListSubheader
                  sx={{ fontSize: "0.8rem", lineHeight: "1.6rem" }}
                >
                  Steps
                </ListSubheader>
              </Tooltip>
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="flex-end"
                spacing={0.3}
              >
                {stepTypes.map((type, key) => (
                  <Tooltip title={`Add a ${type} Step`} key={`step-${key}`}>
                    <ActionButton onClick={() => addStepCallback(type)}>
                      {type[0].toUpperCase()}+
                    </ActionButton>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          }
        >
          <Divider></Divider>
          <Box sx={{ overflow: "auto", height:"100%" }}>
            <div className="spec-inner">
              {specSteps.map((ss, n) => (
                <StepSpec
                  key={n}
                  spec={ss}
                  expand={expandSpecs}
                  deleteCallback={deleteCallback}
                  updateCallback={updateCallback}
                  moveCallback={moveCallback}
                  position={n}
                  nSteps={specSteps.length}
                />
              ))}
            </div>
          </Box>
        </List>
      </Box>
    );
}
