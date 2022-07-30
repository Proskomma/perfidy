import { Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react'
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
  import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
;

function PaneSection({ subheader, tools, children, isOpen = false }) {

  const [open, setOpen] = React.useState(isOpen);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick} sx={{flex: "0 0"}}>
        <Divider></Divider>
        <ListItemIcon>
          {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
        </ListItemIcon>
        <ListItemText primary={subheader} />
        {open && tools}
      </ListItemButton>
      <Collapse sx={{overflow:"auto"}} in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
}

export default PaneSection