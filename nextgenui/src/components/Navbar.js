import * as React from 'react'
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import tentacle from "../images/tentacle.svg"
import {useSettings} from "../settings";
import Typography from "@mui/material/Typography";
import {Tooltip} from "@mui/material";

const Navbar = ({ onMobileNavOpen, ...rest }) => {

    const settings = useSettings()

    return (
        <AppBar
            elevation={0}
            {...rest}
        >
            <Toolbar>
                <Box sx={{display: 'flex', alignItems: "center"}}>
                    <img src={tentacle} alt={"OctoPrint logo"} height={52}/>
                    <Typography sx={{pl: 3}} variant={"h5"} component={"h1"}>
                        {settings.appearance.name !== "" ? settings.appearance.name : "OctoPrint"}
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: {lg: 'block', xs: 'none'}}} >
                    <Tooltip title={"Exit"}>
                        <IconButton color={"inherit"} href={"./"} size="large">
                            <ExitToAppIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ display: {xs: 'block', lg: 'none'}}}>
                    <IconButton color="inherit" onClick={onMobileNavOpen} size="large">
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
