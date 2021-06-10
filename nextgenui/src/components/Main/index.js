import * as React from "react"
import Loading from "../Loading";
import {useQuery} from "react-query";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container"
import Alert from "@material-ui/core/Alert";
import AlertTitle from "@material-ui/core/AlertTitle";

import Layout from "../Layout";
import {SettingsProvider} from "../../settings";
import {useSocket} from "../../client/socketClient";
import {ProfileProvider} from "../../settings/printerprofiles";


export default function Main (props) {
    // When this component is rendered, the socket is connected
    // and the user is authorized, so we can load everything else
    // TODO there is a race condition, if loading all this data is longer than recieving the history event we have issues
    // Maybe swap the order of them?
    // Passive login, then grab settings, then connect & auth socket?
    // OR, render the UI in the background, so that the components start collecting their state before
    // they are visible. This seems like the more sensible option, and might reduce stuttering of the loading screen
    // BUT this breaks the assumptions that settings are fully available for components to start rendering :/
    // We need components to be rendered, but *after* before the socket is connected to make sure we get that info

    const {isLoading: isLoadingSettings, error, data: settings, refetch: refetchSettings} = useQuery("settings", () => {
        return fetch("./api/settings").then(response => response.json())
    })

    const {isLoading: isLoadingProfiles, data: printerProfiles, refetch: refetchProfiles} = useQuery("profiles", () => {
        return fetch("./api/printerprofiles").then(response => response.json())
    })

    useSocket("event", (data) => {
        if (data.event.type === "SettingsUpdated"){
            refetchSettings()
        } else if (data.event.type === "PrinterProfileModified"){
            refetchProfiles()
        }
    })

    const isLoading = (
        isLoadingSettings || isLoadingProfiles
    )

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
                : (isLoading ?
                    <Loading>
                        Loading OctoPrint's UI...
                    </Loading>
                    :
                    <SettingsProvider value={settings}>
                        <ProfileProvider value={printerProfiles}>
                            <Layout />
                        </ProfileProvider>
                    </SettingsProvider>
                )
            }
        </>
    )
}



