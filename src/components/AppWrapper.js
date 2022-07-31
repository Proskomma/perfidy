import React from 'react'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from "../theme";
import { Paper } from '@mui/material';

function AppWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={0} sx={{display:"flex", flexDirection:"column", height:"100vh"}}>{children}</Paper>
    </ThemeProvider>
  );
}

export default AppWrapper