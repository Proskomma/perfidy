import { List } from '@mui/material';
import React from 'react'

function Pane({children,...props}) {
  return (
    <List
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
      {...props}
    >
      {children}
    </List>
  );
}

export default Pane