import React, { useCallback } from "react";
import { Divider, Drawer, Toolbar } from "@mui/material";
import { Box } from "@mui/system";

export const defaultDrawerWidth = 240;
const minDrawerWidth = 50;
const maxDrawerWidth = 1000;

const draggerStyles = {
  width: "5px",
  cursor: "ew-resize",
  padding: "4px 0 0",
  borderTop: "1px solid #ddd",
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 100,
  transition: "0.3s",
  backgroundColor: (theme) => {
    console.log({ theme });
    return theme.palette.primary.dark;
  },
  ":hover": {
    backgroundColor: (theme) => {
      console.log({ theme });
      return theme.palette.primary.light;
    },
  },
};

export default function ResizableDrawer({ children }) {
  const [drawerWidth, setDrawerWidth] = React.useState(defaultDrawerWidth);

  const handleMouseDown = (e) => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseMove = useCallback((e) => {
    const newWidth = e.clientX - document.body.offsetLeft;
    if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth);
    }
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          pr: "5px",
        },
      }}
    >
      <Toolbar variant="dense" />
      <Box onMouseDown={(e) => handleMouseDown(e)} sx={draggerStyles} />
      {children}
      <Divider />
    </Drawer>
  );
}
