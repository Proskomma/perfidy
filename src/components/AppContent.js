import React, { useState } from "react";
import {
  Box,
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
      <Box sx={{ display: "flex" }}>
        <ResultPane specSteps={specSteps}></ResultPane>
      </Box>
    </Box>
  );
}

export default AppContent;
