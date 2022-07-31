import React from 'react'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Avatar } from '@mui/material';

function AppHeader() {
  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar variant="dense">
          <Avatar
            alt="Perfidy"
            src="favicon.ico"
            variant="square"
            sx={{ width: 24, height: 24, mr: ".5rem" }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              gap: ".5rem",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="div">
              Perfidy
            </Typography>
            <Typography variant="caption" component="div">
              - an IDE for PERF
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar variant="dense" />
    </>
  );
}

// function AppHeader() {
//   return (
//     <header className="App-header">
//       <h1 className="program-title">
//         <span className="tooltip">
//           <span className="tooltiptext rtooltiptext">
//             Logo, ready for First PERF World Dev Conference
//           </span>
//           <img className="logo" src={"favicon.ico"} alt="Perfidy Logo" />
//         </span>
//         <span className="tooltip">


//         </span>
//         <span className="tooltip">
//           <span className="tooltiptext rtooltiptext">
//             It's called Perfidy because... oh never mind
//           </span>
//           <span className="smaller-program-title"> - an IDE for PERF</span>
//         </span>
//       </h1>
//     </header>
//   );
// }

export default AppHeader