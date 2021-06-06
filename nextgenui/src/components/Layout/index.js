// Dashboard layout adapted from https://github.com/devias-io/material-kit-react, MIT
import {useState} from "react";
import { experimentalStyled } from "@material-ui/core";
import Navbar from "../Navbar"
import Sidebar from "../Sidebar";

const LayoutRoot = experimentalStyled('div')(
    ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        width: '100%'
    })
);

const LayoutWrapper = experimentalStyled('div')(
    ({ theme }) => ({
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        [theme.breakpoints.up('lg')]: {
            paddingLeft: 256
        }
    })
);

const LayoutContainer = experimentalStyled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
});

const LayoutContent = experimentalStyled('div')({
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto'
});

const Layout = (props) => {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <LayoutRoot>
            <Navbar onMobileNavOpen={() => setMobileNavOpen(true)} />
            <Sidebar
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
            />
            <LayoutWrapper>
                <LayoutContainer>
                    <LayoutContent>
                        {props.children}
                    </LayoutContent>
                </LayoutContainer>
            </LayoutWrapper>
        </LayoutRoot>
    );
};

export default Layout;
