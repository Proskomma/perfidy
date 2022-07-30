import React from 'react'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from "../theme";
import { Paper } from '@mui/material';

function AppWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={0}>{children}</Paper>
    </ThemeProvider>
  );
}

export default AppWrapper