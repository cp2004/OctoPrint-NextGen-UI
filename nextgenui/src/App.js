import * as React from "react";
import Login from "./components/Login"
import Main from "./components/Main"
import Loading from "./components/Loading";

import OctoPrintSocketClient from "./client";
import {SocketProvider} from "./client/socketClient";

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

function App () {
    const [loading, setLoading] = React.useState(true)
    const [authorized, setAuthorized] = React.useState(false)
    const [loginData, setLoginData] = React.useState({
        name: "",
        session: ""
    })

    React.useEffect(() => {
        // Try passive login on first load
        passiveLogin().then((response) => {
            if (response.status === 200){
                response.json().then((data) => {
                    if (data.session) {
                        // Next time, on confusing auth flows: socket connecting
                        setLoginData({name: data.name, session: data.session})
                        setAuthorized(true)
                        setLoading(false)
                    } else {
                        // If not authorized & not loading, we must need a login
                        setLoading(false)
                    }
                })
            } else {
                // Login failed, show login screen
                setLoading(false)
            }
        })
    }, [])

    // If passive login doesn't succeed, we will have to do active login
    const doActiveLogin = ({username, password, remember}) => {
        setLoading(true)
        activeLogin(username, password, remember).then((response) => {
            if (response.status === 200){
                response.json().then((data) => {
                    if (data.session) {
                        // aaand we have a session cookie! Who wants it?
                        setLoginData({name: data.name, session: data.session})
                        setAuthorized(true)
                        setLoading(false)
                    } else {
                        // This shouldn't happen as it should back out with 403
                        setLoading(false)
                    }
                })
            } else {
                setLoading(false)
            }
        })
    }

    if (loading) {
        return (
            <Loading>Connecting to OctoPrint's server... </Loading>
        )
    } else if (authorized) {
        return (
            <Main loginData={loginData} />
        )
    } else if (!authorized) {
        return (
            <Login onLogin={doActiveLogin} />
        )
    }
}

export default App
