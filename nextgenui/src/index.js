import * as React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
// import {SnackbarProvider, snackbarProvider} from "notistack"  // waiting for MUI-V5 compatible patch

import App from './App';
import theme from "./theme"

// Loading Sora font
import '@fontsource/sora/400.css'
import '@fontsource/sora/500.css'
import '@fontsource/sora/700.css'
import '@fontsource/sora/800.css'

import {QueryClient, QueryClientProvider} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";
import {HelmetProvider} from "react-helmet-async";

const client = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false  // Don't want re-rendering on most things
        }
    }
})

ReactDOM.render(
    <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
            <HelmetProvider>
            {/*<SnackbarProvider maxSnack={4}>*/}
                <CssBaseline/>
                <App/>
            {/*</SnackbarProvider>*/}
            </HelmetProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
    document.getElementById('root')
);
