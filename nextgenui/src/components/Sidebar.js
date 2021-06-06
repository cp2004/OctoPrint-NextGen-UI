import {
    Box,
    Button,
    Drawer,
    List,
    Typography
} from '@material-ui/core';
import BarChartIcon from '@material-ui/icons/BarChart';
import PeopleIcon from '@material-ui/icons/People';
import ShoppingBagIcon from '@material-ui/icons/ShoppingBag';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import LockIcon from '@material-ui/icons/Lock';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ErrorIcon from '@material-ui/icons/Error';

import NavItem from './NavItem';

const items = [
    {
        href: '/app/dashboard',
        icon: BarChartIcon,
        title: 'Dashboard'
    },
    {
        href: '/app/customers',
        icon: PeopleIcon,
        title: 'Customers'
    },
    {
        href: '/app/products',
        icon: ShoppingBagIcon,
        title: 'Products'
    },
    {
        href: '/app/account',
        icon: PersonIcon,
        title: 'Account'
    },
    {
        href: '/app/settings',
        icon: SettingsIcon,
        title: 'Settings'
    },
    {
        href: '/login',
        icon: LockIcon,
        title: 'Login'
    },
    {
        href: '/register',
        icon: PersonAddIcon,
        title: 'Register'
    },
    {
        href: '/404',
        icon: ErrorIcon,
        title: 'Error'
    }
];

const Sidebar = ({ onMobileClose, openMobile }) => {
    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box sx={{ p: 2 }}>
                <List>
                    {items.map((item) => (
                        <NavItem
                            href={item.href}
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                        />
                    ))}
                </List>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    m: 2,
                    p: 2
                }}
            >
                <Typography
                    align="center"
                    gutterBottom
                    variant="h4"
                >
                    Need more?
                </Typography>
                <Typography
                    align="center"
                    variant="body2"
                >
                    Upgrade to PRO version and access 20 more screens
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pt: 2
                    }}
                >
                    <Button
                        color="primary"
                        component="a"
                        href="https://react-material-kit.devias.io"
                        variant="contained"
                    >
                        See PRO version
                    </Button>
                </Box>
            </Box>
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

export default Sidebar;
