import Box from "@material-ui/core/Box"
import Drawer from "@material-ui/core/Drawer";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs"
import Typography from "@material-ui/core/Typography";
import tabs from "./TabsList"

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const Sidebar = ({ onMobileClose, openMobile, selectedTab, onTabChange }) => {
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
                    onChange={onTabChange}
                >
                    {tabs.map((item, index) => (
                        <Tab
                            sx={{"& > span": {alignItems: 'flex-start'}}}
                            key={index}
                            label={<TabItem title={item.title} icon={item.icon} />}
                            {...a11yProps(index)}
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
