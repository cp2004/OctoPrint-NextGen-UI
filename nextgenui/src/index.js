import * as React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
// import {SnackbarProvider, snackbarProvider} from "notistack"  // waiting for MUI-V5 compatible patch

import App from './App';
import theme from "./theme"

// Load MUI roboto fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {QueryClient, QueryClientProvider} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";

const client = new QueryClient()

ReactDOM.render(
    <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
            {/*<SnackbarProvider maxSnack={4}>*/}
                <CssBaseline/>
                <App/>
            {/*</SnackbarProvider>*/}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
    document.getElementById('root')
);
