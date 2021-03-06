import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography";
import tabs from "./TabsList"
import {Link as RouterLink, useLocation} from "react-router-dom";

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const Sidebar = ({ onMobileClose, openMobile }) => {
    const {pathname: selectedTab} = useLocation()

    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box sx={{ p: 2 }}>
                <Tabs
                    orientation={"vertical"}
                    variant={"scrollable"}
                    value={selectedTab}
                >
                    {tabs.map((item, index) => (
                        <Tab
                            sx={{alignItems: 'flex-start'}}
                            key={index}
                            label={<TabItem title={item.title} icon={item.icon} />}
                            {...a11yProps(index)}
                            component={RouterLink}
                            to={`/${item.id}`}
                            value={`/${item.id}`}
                        />
                    ))}
                </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
        </Box>
    );

    return (
        <>
            <Box sx={{ display: {xs: 'block', lg: 'none'}}}>
                <Drawer
                    anchor="left"
                    onClose={onMobileClose}
                    open={openMobile}
                    variant="temporary"
                    PaperProps={{
                        sx: {
                            width: 256
                        }
                    }}
                >
                    {content}
                </Drawer>
            </Box>
            <Box sx={{ display: {lg: 'block', xs: 'none'}}}>
                <Drawer
                    anchor="left"
                    open
                    variant="persistent"
                    PaperProps={{
                        sx: {
                            width: 256,
                            top: 64,
                            height: 'calc(100% - 64px)'
                        }
                    }}
                >
                    {content}
                </Drawer>
            </Box>
        </>
    );
};

const TabItem = ({title, icon: Icon}) => (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'left'}}>
        <Icon sx={{mr: 2}} />
        <Typography sx={{textTransform: 'none', letterSpacing: 0}}>{title}</Typography>
    </Box>
)

export default Sidebar;

// label={<TabItem title={item.title} icon={item.icon} />}
