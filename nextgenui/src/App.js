import * as React from "react";
import Login from "./components/Login"
import Main from "./components/Main"
import Loading from "./components/Loading";

import OctoPrintSocketClient from "./client";

window.OctoPrintSocket = new OctoPrintSocketClient("http://localhost:5000")
const SocketClient = window.OctoPrintSocket
SocketClient.onMessage("*", (msg) => console.log(msg))

const login = (data) => {
    return fetch("./api/login", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include",
    }).catch(error => console.error("Error: ", error))
}

const passiveLogin = () => {
    return login({passive: true})
}

const activeLogin = (user, pass, remember) => {
    return login({user: user, pass: pass, remember: remember})
}

const socketConnect = (name, session, callback) => {
    console.log("Connecting...")
    SocketClient.onConnected = () => {
        console.log("socket connect!")
        SocketClient.sendAuth(name, session)
        callback()
    }
    SocketClient.connect()
}

function App () {
    const [loading, setLoading] = React.useState(true)
    const [authorized, setAuthorized] = React.useState(false)

    React.useEffect(() => {
        // Try passive login on first load
        passiveLogin().then((response) => {
            if (response.status === 200){
                response.json().then((data) => {
                    if (data.session) {
                        socketConnect(data.name, data.session, () => {
                            setAuthorized(true)
                            setLoading(false)
                        })
                    }
                })
            } else {
                setLoading(false)
            }
        })
    }, [])

    // If passive login doesn't succeed, we will have to do active login
    const doActiveLogin = ({username, password, remember}) => {
        setLoading(true)
        activeLogin(username, password, remember).then((response) => {
            if (response.status === 200){
                // Login succeeded, socket auth now
                response.json().then((data) => {
                    if (data.session) {
                        socketConnect(data.name, data.session, () => {
                            setAuthorized(true)
                            setLoading(false)
                        })
                    }
                })
            } else {
                setLoading(false)
            }
        })
    }

    return (
        <>
            {loading ? <Loading>Connecting to OctoPrint's server... </Loading> : (authorized ? <Main /> : <Login onLogin={doActiveLogin} />)}
        </>
    )
}

export default App
