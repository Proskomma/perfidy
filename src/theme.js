import { createTheme } from "@mui/material/styles";

const themeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#7be337",
      dark: "#1b1f25",
      light: "#363d46",
    },
    secondary: {
      main: "#7be337",
      contrastText: "rgba(35,32,32,0.87)",
    },
    background: {
      default: "#222b2f",
      paper: "#1b1f25",
    },
  },
};

export const theme = createTheme(themeOptions)