import * as React from "react";
import Drawer from "@material-ui/core/Drawer"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Box from "@material-ui/core/Box";
import PowerIcon from '@material-ui/icons/Power';
import FileIcon from '@material-ui/icons/AttachFile';
import {useState} from "react";
import {useSocket} from "../client/socketClient";

function SideBarItem (props) {
    return (
        <ListItem sx={{
            color: 'text.secondary',
            fontWeight: 'medium',
            justifyContent: 'flex-start',
            letterSpacing: 0,
            py: 1.25,
            textTransform: 'none',
            width: '100%',
            '& svg': {
                mr: 1
            },
            wordBreak: 'break-word'
        }}>
            <props.icon />
            {props.children}
        </ListItem>
    )
}

export default function RightSideBar (props) {
    const [printerState, setPrinterState] = React.useState({
        text: "",
        flags: {}
    })

    const [jobState, setJobState] = useState({
        file: {},
        estimatedPrintTime: 0,
        lastPrintTime: 0,
        filament: {}
    })

    const [progressState, setProgressState] = useState({
        completion: undefined,
        filepos: undefined,
        printTime: undefined,
        printTimeLeft: undefined,
        printTimeLeftOrigin: undefined,
    })

    const onSocketMessage = (msg) => {
        const data = msg.history ? msg.history : msg.current
        setPrinterState(data.state)
        setJobState(data.job)
        setProgressState(data.progress)
    }

    useSocket("current", onSocketMessage)
    useSocket("history", onSocketMessage)

    return (
        <Drawer
            variant={"permanent"}
            anchor={"right"}
            PaperProps={{
            sx: {
                width: 256,
                top: 64,
                height: 'calc(100% - 64px)'
            }}}
        >

            <Box sx={{p: 2}}>
                <List>
                    <SideBarItem icon={PowerIcon}>
                        {printerState.text}
                    </SideBarItem>
                    {jobState.file.display && <SideBarItem icon={FileIcon}>
                        <div title={jobState.file.display}>{jobState.file.display}</div>
                    </SideBarItem>}
                </List>
            </Box>
        </Drawer>
    )
}
