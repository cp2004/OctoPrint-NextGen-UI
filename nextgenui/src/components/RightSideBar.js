import * as React from "react";
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Box from "@mui/material/Box";
import PowerIcon from '@mui/icons-material/Power';
import FileIcon from '@mui/icons-material/AttachFile';
import FailedMessageIcon from '@mui/icons-material/SmsFailed';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PersonIcon from '@mui/icons-material/Person';
import TimerIcon from '@mui/icons-material/Timer';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import {useState} from "react";
import {useSocket} from "../api/socket";
import {ListItemText, ListItemIcon, Skeleton, Divider} from "@mui/material";
import {useSettings} from "../providers/settings";
import {Duration} from "luxon";
import Typography from "@mui/material/Typography";
import fileSize from "filesize";

function SideBarItem ({icon: Icon, children, title, textProps}) {
    return (
        <ListItem sx={{
            color: 'text.secondary',
            fontWeight: 'medium',
            justifyContent: 'flex-start',
            letterSpacing: 0,
            py: 1.25,
            textTransform: 'none',
            width: '100%',
            wordBreak: 'break-word',
        }} disablePadding>
            {Icon && <ListItemIcon sx={{minWidth: 0, mr: 1}}>
                <Icon />
            </ListItemIcon>}
            <ListItemText primaryTypographyProps={{title: title, ...textProps}}>
                {children}
            </ListItemText>
        </ListItem>
    )
}

function ResendRatio ({resendStats}) {
    const resendThreshold = useSettings().serial.resendRatioThreshold
    const error = resendStats.ratio > resendThreshold

    const fmtTransmitted = resendStats.transmitted <= 1000 ? resendStats.transmitted : `${(resendStats.transmitted / 1000).toFixed(1)}K`
    const fmtCount = resendStats.count <= 1000 ? resendStats.count : `${(resendStats.count / 1000).toFixed(1)}K`

    return (
        <SideBarItem icon={FailedMessageIcon} textProps={error && {color: "error"}} title={"Resend Ratio - resends / transmitted (ratio)"}>
            {fmtCount} / {fmtTransmitted} ({resendStats.ratio}%)
            {error && <Typography sx={{display: 'block'}}>Warning! Critical resend ratio</Typography> }
        </SideBarItem>
    )
}

const SKELETON_LINES = [...Array(6).keys()]

export default function RightSideBar (props) {
    const [printerState, setPrinterState] = React.useState({
        notSetYet: true, // This will be removed wen set from socket, use to render skeleton
        text: "",
        flags: {}
    })

    const [resends, setResends] = React.useState({
        count: 0,
        transmitted: 0,
        ratio: 0,
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
        setResends(data.resends)
    }

    useSocket("current", onSocketMessage)
    useSocket("history", onSocketMessage)

    const estimatedTime = (
        jobState.lastPrintTime
            ? jobState.lastPrintTime
            : jobState.estimatedPrintTime
    )
    const timeFmt = Duration
        .fromObject({seconds: estimatedTime ? estimatedTime : 0})
        .toFormat("hh:mm:ss")

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
                            <SideBarItem icon={PowerIcon} title={"Printer State"}>
                            {printerState.text}
                            </SideBarItem>
                            <ResendRatio resendStats={resends} title={"Resend Ratio"} />
                            <Divider />
                            {jobState.file.display && (
                                <>
                                    <SideBarItem icon={FileIcon} title={"Selected File"}>
                                        {jobState.file.display}
                                    </SideBarItem>
                                    <SideBarItem icon={FileUploadIcon} title={"Upload Date"}>
                                        {new Date(jobState.file.date * 1000).toLocaleString()}
                                    </SideBarItem>
                                    <SideBarItem icon={PersonIcon} title={"User"} >
                                        {jobState.user}
                                    </SideBarItem>
                                    <SideBarItem icon={TimerIcon} title={"Estimated Print Time"}>
                                        {estimatedTime ? timeFmt : "-"}
                                    </SideBarItem>
                                    <Divider />
                                    <SideBarItem title={"Print Time"}>
                                        {'Print Time: '}
                                        {Duration
                                            .fromObject({seconds: progressState.printTime ? progressState.printTime : 0})
                                            .toFormat("hh:mm:ss")}
                                    </SideBarItem>
                                    <SideBarItem title={"Print Time Left"}>
                                        {'Print Time Left: '}
                                        {Duration
                                            .fromObject({seconds: progressState.printTimeLeft ? progressState.printTimeLeft : 0})
                                            .toFormat("hh:mm:ss")}
                                    </SideBarItem>
                                    <SideBarItem title={"Printed"}>
                                        Printed: {fileSize(progressState.filepos)} / {fileSize(jobState.file.size)}
                                    </SideBarItem>
                                </>
                            )}
                        </>
                        )}
                </List>
            </Box>
        </Drawer>
    )
}
