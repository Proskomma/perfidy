import React, { useState } from "react";
import {
  Box,
  ButtonBase,
  ButtonGroup,
  Divider,
  List,
  ListSubheader,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import { ResultPane } from "./ResultPane";
import { SpecPane } from "./SpecPane";
import ResizableDrawer from "./ResizableDrawer";



function AppContent() {
  const [specSteps, setSpecSteps] = useState([]);

  return (
    <Box sx={{ display: "flex" }}>
      <ResizableDrawer>
        <SpecPane specSteps={specSteps} setSpecSteps={setSpecSteps}></SpecPane>
      </ResizableDrawer>
      <Box>
        <ResultPane specSteps={specSteps}></ResultPane>
      </Box>
    </Box>
  );
}

export default AppContent;
