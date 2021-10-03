// Dashboard layout adapted from https://github.com/devias-io/material-kit-react, MIT
import { styled } from '@mui/material/styles';
import Navbar from "./Navbar"
import Sidebar from "./Sidebar";
import RightSideBar from "./RightSideBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as React from "react";
import tabs from "./TabsList"
import {Helmet} from "react-helmet-async";
import {useSettings} from "../providers/settings";
import {Fade} from "@mui/material";
import {HashRouter as Router, Route, Redirect} from "react-router-dom";

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

    const name = useSettings().appearance.name

    return (
        <Router>
            <LayoutRoot>
                <Helmet>
                    <title>{name === "" ? "OctoPrint" : name + " [OctoPrint]"}</title>
                </Helmet>
                <Navbar onMobileNavOpen={() => setMobileNavOpen(true)} />
                <Sidebar
                    onMobileClose={() => setMobileNavOpen(false)}
                    openMobile={isMobileNavOpen}
                />
                <LayoutWrapper>
                    <LayoutContainer>
                        <LayoutContent>
                            <OctoPrintUI /> {/*TODO moving this here is suboptimal, wanted it to be generic layout*/}
                        </LayoutContent>
                    </LayoutContainer>
                </LayoutWrapper>
                {/* TODO responsive sidebar */}
                <RightSideBar />
            </LayoutRoot>
        </Router>
    );
};

function OctoPrintUI () {
    return (
        <Box sx={{
            backgroundColor: 'background.default',
            minHeight: '100%',
            py: 3
        }}>
            <Container sx={{overflowY: 'visible'}} maxWidth={false}>
                {
                    tabs.map(({tab: Tab, id}, index) => (
                        <Route key={index} path={`/${id}`} children={({match}) => {
                            const active = !!match

                            return (
                                <TabPanel key={index} active={active} index={index}>
                                    <Tab isActive={active} />
                                </TabPanel>
                            )
                        }} />
                    ))
                }
                <Route
                    path={"*"}
                    children={({match}) => (
                        match && <Redirect to={`/${tabs[0].id}`} />
                    )}
                />
            </Container>
        </Box>
    )
}

function TabPanel (props) {
    const { children, active, index, ...other } = props;

    return (
        <Fade in={active}>
            <Box
                role="tabpanel"
                style={{display: (active) ? 'block' : 'none'}}
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
