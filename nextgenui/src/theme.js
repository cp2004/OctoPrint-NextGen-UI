import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

const systemFont = [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
];


// A custom theme for this app
const theme = createTheme({
    palette: {
        primary: {
            main: '#9c27b0',
        },
        secondary: {
            main: '#ff3d00',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },
    typography: {
        fontFamily: ['"Sora"', ...systemFont].join(','),
        fontWeightLight: 400,
        fontWeightRegular: 500,
        fontWeightBold: 800,
        fontWeightMedium: 700,
        button: {
            textTransform: 'initial',
            fontWeight: 500,
        }
    },
    shape: {
        borderRadius: 7
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            }
        }
    }
});

export default theme;
