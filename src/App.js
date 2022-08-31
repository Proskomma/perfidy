import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import SetupPane from "./components/SetupPane";
import RunPane from "./components/RunPane";

function App() {
    const [topTab, setTopTab] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTopTab(newValue);
    };

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    }

    function a11yProps(index) {
        return {
            id: `top-tab-${index}`,
            'aria-controls': `top-tabpanel-${index}`,
        };
    }

    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <img style={{width: "50px", height: "50px", marginRight: "15px"}} src={"favicon.ico"} alt="Perfidy Logo"/>
                    Perfidy: an IDE for PERF
                </Typography>
            </Toolbar>
        </AppBar>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
            <Tabs value={topTab} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Setup" {...a11yProps(0)} />
                <Tab label="Run" {...a11yProps(1)} />
            </Tabs>
        </Box>
        <TabPanel value={topTab} index={0}>
            <SetupPane/>
        </TabPanel>
        <TabPanel value={topTab} index={1}>
            <RunPane/>
        </TabPanel>
     </>
}

export default App;
