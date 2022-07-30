import React from "react";
import { ButtonBase } from "@mui/material";

export function ActionButton({ children, ...props }) {
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
