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
import {useState} from "react";
import {useSocket} from "../api/socket";
import {
    ListItemText,
    ListItemIcon,
    Skeleton,
    Divider,
    Select,
    InputLabel,
    FormControl,
    Button, LinearProgress,
} from "@mui/material";
import {useSettings} from "../providers/settings";
import {Duration} from "luxon";
import Typography from "@mui/material/Typography";
import fileSize from "filesize";
import LoadingButton from "@mui/lab/LoadingButton"
import MenuItem from "@mui/material/MenuItem";
import ReplayIcon from '@mui/icons-material/Replay';
import PrintIcon from '@mui/icons-material/Print';
import {connect, disconnect, getSettings as getConnectionSettings} from "../api/connection";
import {useQuery} from "react-query";
import {useSnackbar} from "notistack";
import {usePrinterState, usePrinterStateStore} from "../state/printerState";
import {useJobState, useJobStateStore} from "../state/jobState";
import {start, restart, pause, resume, togglePause, cancel} from "../api/job"
import {confirmDialog} from "../utils/confirmDialog";
import {styled} from "@mui/material/styles";


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

const SKELETON_LINES = [...Array(10).keys()]

function PrinterState ({state: printerState}) {
    const [resends, setResends] = React.useState({
        count: 0,
        transmitted: 0,
        ratio: 0,
    })

    const jobState = useJobState()

    const [progressState, setProgressState] = useState({
        completion: undefined,
        filepos: undefined,
        printTime: undefined,
        printTimeLeft: undefined,
        printTimeLeftOrigin: undefined,
    })

    const onSocketMessage = (msg) => {
        const data = msg.history ? msg.history : msg.current
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
        <List>
            {printerState.notSetYet
                ? SKELETON_LINES.map((lineNo) => <Skeleton key={lineNo} height={52} variant={"text"} />)
            : (
                <>
                    <SideBarItem icon={PowerIcon} title={"Printer State"}>
                    {printerState.text}
                    </SideBarItem>
                    {printerState.flags.operational && <ResendRatio resendStats={resends} title={"Resend Ratio"} />}
                    <Divider component={"li"} />
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
                            <PrintProgress completion={progressState.completion} />
                            <SideBarItem title={"Print Time"}>
                                {'Print Time: '}
                                {Duration
                                    .fromObject({seconds: progressState.printTime || 0})
                                    .toFormat("hh:mm:ss")}
                            </SideBarItem>
                            <SideBarItem title={"Print Time Left"}>
                                {'Print Time Left: '}
                                {Duration
                                    .fromObject({seconds: progressState.printTimeLeft || 0})
                                    .toFormat("hh:mm:ss")}
                            </SideBarItem>
                            <SideBarItem title={"Printed"}>
                                Printed: {fileSize(progressState.filepos || 0)} / {fileSize(jobState.file.size || 0)}
                            </SideBarItem>
                        </>
                    )}
                </>
                )}
        </List>
    )
}

const PrintLinearProgress = styled(LinearProgress)({
    height: 10,
    borderRadius: 10,
})


function PrintProgress ({completion}) {
    return (
        <ListItem sx={{display: 'flex', alignItems: 'center', py: 1.25}} disablePadding>
            <Box sx={{width: '100%', mr: 1}}>
                <PrintLinearProgress value={completion} variant={"determinate"} />
            </Box>
            <Box sx={{minWidth: 35}}>
                <Typography variant={"body2"} color={"text.secondary"}>
                    {`${Math.round(completion)}%`}
                </Typography>
            </Box>
        </ListItem>
    )
}


const connectionButtonProps = {
    variant: "contained",
    color: "secondary",
    fullWidth: true,
}

function ConnectionState ({isConnected}) {
    const [loading, setLoading] = React.useState(false)
    const [selectedPort, setSelectedPort] = React.useState("")
    const [selectedBaudrate, setSelectedBaudrate] = React.useState("")
    const [selectedProfile, setSelectedProfile] = React.useState("")
    // const [saveOptions, setSaveOptions] = React.useState(false)
    // const [autoconnect, setAutoconnect] = React.useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const {isLoading: dataLoading, error, data: connectionSettings} = useQuery("connection", () => {
        return getConnectionSettings()
    })

    const handleConnect = () => {
        setLoading(true)

        const connectionOptions = {}
        if (selectedPort && selectedPort !== "auto") connectionOptions.port = selectedPort
        if (selectedBaudrate && selectedBaudrate !== "auto") connectionOptions.baudrare = selectedBaudrate
        if (selectedProfile) connectionOptions.printerProfile = selectedProfile

        connect(connectionOptions).then((response) => {
            if (!response.ok) {
                enqueueSnackbar("Error connecting to printer", {variant: "error"})
            }
            setLoading(false)
        })
    }

    const handleDisconnect = () => {
        setLoading(true)
        disconnect().then(() => setLoading(false))
    }

    const handleSelectChange = (event) => {
        const configType = event.target.name
        const value = event.target.value

        if (configType === "port") setSelectedPort(value)
        if (configType === "baudrate") setSelectedBaudrate(value)
        if (configType === "profile") setSelectedProfile(value)
    }

    const optionsAvailable = connectionSettings && !(error || connectionSettings.error)

    React.useEffect(() => {
        if (!optionsAvailable && !dataLoading) {
            enqueueSnackbar("Failed to fetch connection settings", {variant: "error"})
        }
    }, [enqueueSnackbar, optionsAvailable, dataLoading])

    if (isConnected){
        return (
            <LoadingButton loading={loading || dataLoading} onClick={handleDisconnect} {...connectionButtonProps}>Disconnect</LoadingButton>
        )
    } else {
        return (
            <Box component={"form"} onSubmit={handleConnect} sx={{"& .MuiFormControl-root": {my: 2}}}>
                <FormControl fullWidth>
                    <InputLabel id="serial-port">Serial Port</InputLabel>
                    <Select
                        labelId="serial-port"
                        label="Serial Port"
                        value={selectedPort}
                        disabled={dataLoading}
                        name={"port"}
                        onChange={handleSelectChange}
                    >
                        <MenuItem value={"auto"}>AUTO</MenuItem>
                        {optionsAvailable && connectionSettings.options.ports.map((port, index) => (
                            <MenuItem key={index} value={port}>{port}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="baud-rate">Baud Rate</InputLabel>
                    <Select
                        labelId="baud-rate"
                        label="Baud Rate"
                        value={selectedBaudrate}
                        name={"baudrate"}
                        onChange={handleSelectChange}
                    >
                        <MenuItem value={"auto"}>AUTO</MenuItem>
                        {optionsAvailable && connectionSettings.options.baudrates.map((baud, index) => (
                            <MenuItem key={index} value={baud}>{baud}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="printer-profile">Printer Profile</InputLabel>
                    <Select
                        labelId="printer-profile"
                        label="Printer Profile"
                        value={selectedProfile}
                        name={"profile"}
                        onChange={handleSelectChange}
                    >
                        {optionsAvailable && connectionSettings.options.printerProfiles.map((profile) => (
                            <MenuItem key={profile.id} value={profile.id}>{profile.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <LoadingButton loading={loading || dataLoading} onClick={handleConnect} {...connectionButtonProps}>Connect</LoadingButton>
            </Box>
        )
    }
}

function PrintControls () {
    const flags = usePrinterStateStore(state => state.flags)

    const filename = useJobStateStore(state => state.file.name)

    // Button state summaries
    const showPrint = (
        flags.operational
        && flags.ready
        && !flags.printing
        && !flags.cancelling
        && !flags.pausing
        && !flags.paused
        // TODO permissions
    )

    const enablePrint = filename

    const showPause = (
        flags.operational
        && flags.printing
        && !flags.paused
    )

    const enablePause = (
        !flags.pausing
        && !flags.cancelling
    )

    const enableResume = (
        flags.operational
        && flags.paused
    )

    const showCancel = (
        flags.operational
        && (flags.printing || flags.paused)
    )

    const enableCancel = (
        !flags.pausing
        && !flags.cancelling
    )

    const showRestart = (
        flags.operational
        && flags.paused
    )

    // Button click handlers, with settings for their behaviour
    const settings = useSettings()
    const [requestInProgress, setRequestInProgress] = React.useState(false)

    const handlePrint = () => {
        const startPrint = () => {
            apiCall(start)
        }

        if (settings.feature.printStartConfirmation) {
            confirmDialog(
                "Do you want to start the print job now?",
                "This will start a new print job. Please check that the print bed is clear.",
                startPrint
            )
        } else {
            startPrint()
        }
    }

    const handlePause = () => {
        apiCall(pause)
    }

    const handleResume = () => {
        apiCall(resume)
    }

    const handleCancel = () => {
        const cancelPrint = () => {
            apiCall(cancel)
        }

        if (settings.feature.printCancelConfirmation) {
            confirmDialog(
                "Are you sure?",
                "This will cancel your print.",
                cancelPrint
            )
        } else {
            cancelPrint()
        }
    }

    const handleRestart = () => {
        confirmDialog(
            "Are you sure?",
            "This will restart the print job from the beginning.",
            () => apiCall(restart)
        )
    }

    const apiCall = (target) => {
        setRequestInProgress(true)
        return target().then(() => setRequestInProgress(false))
    }


    return (
        <Box sx={{"&> *": {mb: 1}}} >
            {showPrint &&
            <LoadingButton loading={requestInProgress} variant={"contained"} fullWidth disabled={!enablePrint} onClick={handlePrint}>
                <PrintIcon />
                Print
            </LoadingButton>
            }
            <Box sx={{display: 'flex' }}>
                {showPause &&
                <LoadingButton loading={requestInProgress} variant={"contained"} sx={{mr: 1, flexGrow: 0.5}} disabled={!enablePause} onClick={handlePause}>
                    Pause
                </LoadingButton>
                }
                {enableResume &&
                <LoadingButton loading={requestInProgress} variant={"contained"} sx={{mr: 1, flexGrow: 0.5}} onClick={handleResume}>
                    Resume
                </LoadingButton>
                }
                {showCancel &&
                <LoadingButton loading={requestInProgress} variant={"contained"} color={"error"} sx={{ml: 1, flexGrow: 0.5}} disabled={!enableCancel} onClick={handleCancel}>
                    Cancel
                </LoadingButton>
                }
            </Box>
            {showRestart &&
            <LoadingButton loading={requestInProgress} variant={"contained"} color={"error"} fullWidth onClick={handleRestart}>
                <ReplayIcon />
                Restart
            </LoadingButton>
            }
        </Box>
    )
}


export default function RightSideBar() {
    const printerState = usePrinterState()

    const isConnected = !printerState.flags.closedOrError

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
                <ConnectionState isConnected={isConnected} />
                <Divider sx={{my: 2}}/>
                <PrintControls />
                <PrinterState state={printerState} />
            </Box>
        </Drawer>
    )
}
