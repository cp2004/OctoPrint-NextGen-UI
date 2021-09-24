import * as React from "react";
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Box from "@mui/material/Box";
import PowerIcon from '@mui/icons-material/Power';
import FileIcon from '@mui/icons-material/AttachFile';
import {useState} from "react";
import {useSocket} from "../api/socket";
import {Skeleton} from "@mui/material";

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

const SKELETON_LINES = [...Array(2).keys()]

export default function RightSideBar (props) {
    const [printerState, setPrinterState] = React.useState({
        notSetYet: true, // This will be removed wen set from socket, use to render skeleton
        text: "",
        flags: {}
    })

    const [jobState, setJobState] = useState({
        file: {},
        estimatedPrintTime: 0,
        lastPrintTime: 0,
        filament: {}
    })

    /* eslint-disable-next-line */
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
                    {printerState.notSetYet
                        ? SKELETON_LINES.map((lineNo) => <Skeleton key={lineNo} variant={"text"} />)
                    : (
                        <>
                            <SideBarItem icon={PowerIcon}>
                            {printerState.text}
                            </SideBarItem>
                            {jobState.file.display && <SideBarItem icon={FileIcon}>
                                <div title={jobState.file.display}>{jobState.file.display}</div>
                            </SideBarItem>}
                        </>
                        )}
                </List>
            </Box>
        </Drawer>
    )
}
