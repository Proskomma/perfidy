import React from 'react';
import Box from '@mui/material/Box';

import SetupProskomma from "./SetupProskomma";
import SetupSources from "./SetupSources";
import SetupTransforms from "./SetupTransforms";
import SetupDisplays from "./SetupDisplays";

export default function SetupPane() {
    return <Box>
        <SetupProskomma/>
        <SetupSources/>
        <SetupTransforms/>
        <SetupDisplays/>
    </Box>
    }
