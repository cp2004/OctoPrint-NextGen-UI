import * as React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {SnackbarProvider} from "notistack"

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
import {Container} from "@mui/material";
import Typography from "@mui/material/Typography";
import ErrorBoundary from "./components/ErrorBoundary";

const client = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false  // Don't want re-rendering on most things
        }
    }
})

function IndexError () {
    return (
        <Container maxWidth={"lg"} sx={{my: 10, textAlign: 'center'}}>
            <Typography variant={"h2"} component={"h1"} color={"error"}>
                There was an error rendering OctoPrint's UI
            </Typography>
            <Typography variant={"h4"} component={"h2"}>
                Please report the contents of the browser console on the NextGenUI bug tracker.
            </Typography>
        </Container>
    )
}

function Index () {
    return (
            <QueryClientProvider client={client}>
                <ThemeProvider theme={theme}>
                    <ErrorBoundary onError={IndexError}>
                        <HelmetProvider>
                            <SnackbarProvider maxSnack={4}>
                                <CssBaseline/>
                                <App/>
                            </SnackbarProvider>
                        </HelmetProvider>
                    </ErrorBoundary>
                </ThemeProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
    )
}

ReactDOM.render(
    <Index />,
    document.getElementById('root')
);
