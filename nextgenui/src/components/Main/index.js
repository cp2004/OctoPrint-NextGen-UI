import * as React from "react"
import Loading from "../Loading";
import {useQuery} from "react-query";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container"
import Alert from "@material-ui/core/Alert";
import AlertTitle from "@material-ui/core/AlertTitle";
import Grid from "@material-ui/core/Grid";

function Layout (props) {
    return (
        <Grid columns={12}>
            <Grid item lg={3} md={4} sm={12}>
                <Typography>Sidebar?</Typography>
            </Grid>
        </Grid>
    )
}

export default function Main (props) {
    // When this component is rendered, the socket is fully connected
    // and the user is authorized

    const {isLoading, error, data: settings} = useQuery("settings", () => {
        return fetch("./api/settings").then(response => response.json())
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
                    : <p>Main UI, data {JSON.stringify(settings)}</p>
                )
            }
        </>
    )
}
