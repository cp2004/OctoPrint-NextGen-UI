import * as React from "react"
import Loading from "../Loading";
import {useQuery} from "react-query";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container"
import Alert from "@material-ui/core/Alert";
import AlertTitle from "@material-ui/core/AlertTitle";

import Layout from "../Layout";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {SettingsProvider, useSettings} from "../../settings";
import {useSocket} from "../../client/socketClient";

export default function Main (props) {
    // When this component is rendered, the socket is connected
    // and the user is authorized, so we can load everything else
    // TODO verify there is no race condition with the `connected` event
    // which might cause us some issues

    const {isLoading, error, data: settings, refetch} = useQuery("settings", () => {
        return fetch("./api/settings").then(response => response.json())
    })

    useSocket("event", (data) => {
        if (data.event.type === "SettingsUpdated"){
            refetch()
        }
    })

    if (error) {
        return (
            <Container maxWidth={"sm"}>
                <Typography variant={"h1"} color={"primary"}>
                    There was an error fetching the settings, these are needed to run the UI.
                </Typography>
            </Container>
        )
    }

    return (
        <>
            {settings && settings.error ?
                <Container maxWidth={"sm"}>
                    <Alert severity={"error"} sx={{mt: 10}}>
                        <AlertTitle>Error loading settings</AlertTitle>
                        There was an error loading the settings
                    </Alert>
                </Container>
                : (isLoading
                    ? <Loading color={"secondary"}>
                        Loading OctoPrint's UI...
                    </Loading>
                    :
                        <SettingsProvider value={settings}>
                            <Layout>
                                <OctoPrintUI />
                            </Layout>
                        </SettingsProvider>
                )
            }
        </>
    )
}


function OctoPrintUI () {
    const settings = useSettings()

    return (
        <Box sx={{
            backgroundColor: 'background.default',
            minHeight: '100%',
            py: 3
        }}>
            <Container maxWidth={false}>
                <Grid container spacing={3}>
                    <Grid item lg={3} sm={6} xl={3} xs={12}>
                        <p>OctoPrint server: {settings.appearance.name}</p>
                    </Grid>
                    <Grid item lg={3} sm={6} xl={3} xs={12}>
                        <p>Total customers></p>
                    </Grid>
                    <Grid item lg={3} sm={6} xl={3} xs={12}>
                        <p>Tasks progress</p>
                    </Grid>
                    <Grid item lg={3} sm={6} xl={3} xs={12}>
                        <p>Total profit</p>
                    </Grid>
                    <Grid item lg={8} md={12} xl={9} xs={12}>
                        <p>Sales...</p>
                    </Grid>
                    <Grid item lg={4} md={6} xl={3} xs={12}>
                        <p>Traffic by device...</p>
                    </Grid>
                    <Grid item lg={4} md={6} xl={3} xs={12}>
                        <p>Latest products...</p>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}
