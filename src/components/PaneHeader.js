import React from "react";
import {
    ListSubheader,
    Stack,
    Tooltip,
} from "@mui/material";


export default function PaneHeader({ tools, text, tooltip }) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
        >
            <Tooltip title={tooltip}>
                <ListSubheader sx={{ fontSize: "0.8rem", lineHeight: "1.6rem" }}>
                    {text}
                </ListSubheader>
            </Tooltip>
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="flex-end"
                spacing={0.3}
            >
                {tools}
            </Stack>
        </Stack>
    );
}
