import * as React from "react"
import {useQuery} from "react-query";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container"
import Alert from "@material-ui/core/Alert";
import AlertTitle from "@material-ui/core/AlertTitle";

import Loading from "../Loading";
import Layout from "../Layout";
import {SettingsProvider} from "../../settings";
import {SocketProvider, useSocket} from "../../client/socketClient";
import {ProfileProvider} from "../../settings/printerprofiles";
import OctoPrintSocketClient from "../../client";

// WDS uses sockjs for hot-reloading, so OctoPrint's socket does not
// work with the built in proxy & we have to manually override the URL here
let SOCKET_URL
if (process.env.NODE_ENV !== "production"){
    SOCKET_URL = "http://localhost:5000"  // CHANGE THIS when you are developing, TODO document
} else {
    SOCKET_URL = "."
}

const SocketClient =  new OctoPrintSocketClient(SOCKET_URL)
// Attach to window for useful debugging in console
window.OctoPrintSocket = SocketClient

const socketConnect = (name, session) => {
    console.log("Connecting...")
    SocketClient.onConnected = () => {
        console.log("Socket connect!")
        SocketClient.sendAuth(name, session)
    }
    SocketClient.connect()
}

function Main ({ loginData }) {
    /* Rough outline of load flow:
     * * Passive login
     * * Fetch settings, printer profile etc. anything necessary for rendering
     * * Render UI & connect to socket
     * If the flow does not go like this there may be race conditions
     * Components can assume that settings will be available, but must be able to cope with no socket data
     */

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

    React.useEffect(() => {
        if (!isLoadingSettings && !isLoadingProfiles){
            // Data has been fetched, to socket auth we go
            socketConnect(loginData.name, loginData.session)
        }
    }, [isLoadingProfiles, isLoadingSettings, loginData]) // loginData SHOULD not change after initial render

    if (error) {
        return (
            <Container maxWidth={"sm"}>
                <Typography variant={"h1"} color={"primary"}>
                    There was an error fetching the settings, these are needed to run the UI.
                </Typography>
            </Container>
        )
    }

    if (settings && settings.error) {
        return (
            <Container maxWidth={"sm"}>
                <Alert severity={"error"} sx={{mt: 10}}>
                    <AlertTitle>Error loading settings</AlertTitle>
                    There was an error loading the settings
                </Alert>
            </Container>
        )
    } else if (isLoading) {
        return (
            <Loading>
                Loading OctoPrint's UI...
            </Loading>
        )
    } else {
        return (
            <Providers settings={settings} profiles={printerProfiles}>
                <Layout />
            </Providers>
        )
    }
}

export default function MainWrapper (props) {
    return (
        <SocketProvider value={SocketClient}>
            <Main {...props} />
        </SocketProvider>
    )
}

const Providers = ({settings, profiles, children}) => (
    <SettingsProvider value={settings}>
        <ProfileProvider value={profiles}>
            {children}
        </ProfileProvider>
    </SettingsProvider>
)


