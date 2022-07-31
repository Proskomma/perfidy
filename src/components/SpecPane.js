import React, { useState } from "react";

import StepSpec from "./StepSpec";
import stepTemplates from "../lib/stepTemplates";
import {
    Box,
    Tooltip, Typography,
} from "@mui/material";

import { ActionButton } from "./ActionButton";
import PaneSection from "./PaneSection";
import Pane from "./Pane";
import PaneItem from "./PaneItem";
import PaneHeader from "./PaneHeader";
import SaveStepsButton from "./SaveStepsButton";
import LoadStepsButton from "./LoadStepsButton";

const stepTypes = ["Source", "Transform", "Display"];


export function SpecPane({ setSpecSteps, specSteps }) {
    const [nextStepId, setNextStepId] = useState(1);
    const [expandSpecs] = useState(true);

    const stepsTools = stepTypes.map((type, key) => (
        <Tooltip title={`Add a ${type} Step`} key={`step-${key}`}>
            <ActionButton
                onClick={(e) => {
                    e.stopPropagation();
                    addStepCallback(type);
                }}
            >
                {type[0].toUpperCase()}+
            </ActionButton>
        </Tooltip>
    ));

    const specTools = (
        <>
            <SaveStepsButton steps={specSteps} />
            <LoadStepsButton setSpecSteps={setSpecSteps} setNextStepId={setNextStepId} />
        </>
    );

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

    const deleteCallback = (deleteId) =>
        setSpecSteps((specSteps) => specSteps.filter((v) => v.id !== deleteId));



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
        const newTemplate =
            stepTemplates[newSpec.type][newSpecSubtypes[newSpec.type]];
        for (const key of Object.keys(newSpec)) {
            if (
                !["id", "title"].includes(key) &&
                !Object.keys(newTemplate).includes(key)
            ) {
                delete newSpec[key];
            }
        }
        delete newSpec.description;
        for (const key of Object.keys(newTemplate)) {
            if (!Object.keys(newSpec).includes(key)) {
                newSpec[key] = newTemplate[key];
            }
        }
        setSpecSteps((specSteps) =>
            specSteps.map((v) => (v.id === newSpec.id ? newSpec : v))
        );
    };

    return (
      <Pane
        subheader={
          <PaneHeader
            text={"Spec"}
            tools={specTools}
            tooltip={"Start your pipeline here"}
          />
        }
      >
        <PaneSection subheader={"steps"} tools={stepsTools} isOpen={true}>
          {specSteps.length ? (
            specSteps.map((ss, n) => (
              <PaneItem>
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
              </PaneItem>
            ))
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "2rem",
              }}
            >
              <Typography variant="overline" sx={{color: (theme) => theme.palette.text.disabled}}>
                Empty
              </Typography>
            </Box>
          )}
        </PaneSection>
        <PaneSection subheader={"other"}></PaneSection>
      </Pane>
    );
}
