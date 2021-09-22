// Dashboard layout adapted from https://github.com/devias-io/material-kit-react, MIT
import { styled } from '@mui/material/styles';
import Navbar from "../Navbar"
import Sidebar from "../Sidebar";
import RightSideBar from "../RightSideBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as React from "react";
import tabs from "../TabsList"
import {Helmet} from "react-helmet-async";
import {useSettings} from "../../settings";
import {Fade} from "@mui/material";

const LayoutRoot = styled('div')(
    ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        width: '100%'
    })
);

const LayoutWrapper = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        [theme.breakpoints.up('lg')]: {
            paddingLeft: 256
        },
        paddingRight: 256
    })
);

const LayoutContainer = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
});

const LayoutContent = styled('div')({
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto'
});

const Layout = (props) => {
    const [isMobileNavOpen, setMobileNavOpen] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState(0)

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue)
    }

    const name = useSettings().appearance.name

    return (
        <LayoutRoot>
            <Helmet>
                <title>{name === "" ? "OctoPrint" : name + " [OctoPrint]"}</title>
            </Helmet>
            <Navbar onMobileNavOpen={() => setMobileNavOpen(true)} />
            <Sidebar
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}
            />
            <LayoutWrapper>
                <LayoutContainer>
                    <LayoutContent>
                        <OctoPrintUI selectedTab={selectedTab} /> {/*TODO moving this here is suboptimal, wanted it to be generic layout*/}
                    </LayoutContent>
                </LayoutContainer>
            </LayoutWrapper>
            {/* TODO responsive sidebar? */}
            <RightSideBar />
        </LayoutRoot>
    );
};

function OctoPrintUI ({selectedTab}) {
    return (
        <Box sx={{
            backgroundColor: 'background.default',
            minHeight: '100%',
            py: 3
        }}>
            <Container sx={{overflowY: 'visible'}} maxWidth={false}>
                {
                    tabs.map(({tab: Tab}, index) => (
                        <TabPanel key={index} value={selectedTab} index={index}>
                            <Tab isActive={selectedTab === index} />
                        </TabPanel>
                    ))
                }
            </Container>
        </Box>
    )
}

function TabPanel (props) {
    const { children, value, index, ...other } = props;

    return (
        <Fade in={value === index}>
            <Box
                role="tabpanel"
                style={{display: (value === index) ? 'block' : 'none'}}
                id={`vertical-tabpanel-${index}`}
                aria-labelledby={`vertical-tab-${index}`}
                {...other}
            >
                {children}
            </Box>
        </Fade>
    );
}

export default Layout;
