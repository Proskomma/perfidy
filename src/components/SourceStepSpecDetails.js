import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React from "react";

function SourceStepSpecDetails({ spec, updateCallback }) {
    const isInvalidJson = content => {
        try {
            JSON.parse(content);
            return false;
        } catch (err) {
            return true;
        }
    }
    return (
        <>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                <FormControl sx={{ m: 1, minWidth: 80, flexGrow: 1 }} size="small">
                    <InputLabel id={`sourceLocation-${spec.id}`}>Location</InputLabel>
                    <Select
                        labelId={`sourceLocation-${spec.id}`}
                        label={"Location"}
                        onChange={(e) => {
                            const newSpec = {
                                ...spec,
                                sourceLocation: e.target.value,
                            };
                            updateCallback(newSpec);
                        }}
                        defaultValue={spec.sourceLocation}
                        a
                    >
                        {["local", "http"].map((op, n) => (
                            <MenuItem key={n} value={op}>
                                {op}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 80, flexGrow: 1 }} size="small">
                    <InputLabel id={`outputType-${spec.id}`}>Output Type</InputLabel>
                    <Select
                        labelId={`outputType-${spec.id}`}
                        label={"Output Type"}
                        onChange={(e) => {
                            const newSpec = {
                                ...spec,
                                outputType: e.target.value,
                            };
                            updateCallback(newSpec);
                        }}
                        defaultValue={spec.outputType}
                        a
                    >
                        {["text", "json"].map((op, n) => (
                            <MenuItem key={n} value={op}>
                                {op}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {spec.sourceLocation === "local" && (
                    <FormControl sx={{ m: 1, minWidth: 80, flexGrow: 1 }} size="small">
                        <TextField
                            multiline
                            maxRows={4}
                            error={
                                spec.outputType === "json" && isInvalidJson(spec.localValue)
                            }
                            label="Value"
                            name={`localValue-${spec.id}`}
                            onChange={(e) => {
                                const newSpec = {
                                    ...spec,
                                    localValue: e.target.value || "",
                                };
                                updateCallback(newSpec);
                            }}
                            defaultValue={spec.localValue}
                            size="small"
                        />
                    </FormControl>
                )}
                {spec.sourceLocation === "http" && (
                    <FormControl
                        sx={{ m: 1, minWidth: 80, flexGrow: 1 }}
                        size="small"
                    >
                        <TextField
                            multiline
                            maxRows={4}
                            error={
                                spec.outputType === "json" && isInvalidJson(spec.httpUrl)
                            }
                            label="URL"
                            name={`httpUrl-${spec.id}`}
                            onChange={(e) => {
                                const newSpec = {
                                    ...spec,
                                    httpUrl: e.target.value || "",
                                };
                                updateCallback(newSpec);
                            }}
                            defaultValue={spec.httpUrl}
                            size="small"
                        />
                    </FormControl>
                )}
            </Box>
        </>
    );
}

export default SourceStepSpecDetails;
