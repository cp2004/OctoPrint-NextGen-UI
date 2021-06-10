import AppBar from "@material-ui/core/AppBar"
import Box from "@material-ui/core/Box"
import IconButton from "@material-ui/core/IconButton"
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import tentacle from "../images/tentacle.svg"
import {useSettings} from "../settings";
import Typography from "@material-ui/core/Typography";

const DashboardNavbar = ({ onMobileNavOpen, ...rest }) => {

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
                        {settings.appearance.name}
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: {lg: 'block', xs: 'none'}}} >
                    <IconButton color={"inherit"}>
                        <NotificationsIcon />
                    </IconButton>
                </Box>
                <Box sx={{ display: {xs: 'block', lg: 'none'}}}>
                    <IconButton
                        color="inherit"
                        onClick={onMobileNavOpen}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardNavbar;
