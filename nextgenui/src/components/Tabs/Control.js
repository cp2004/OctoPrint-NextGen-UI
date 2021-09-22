import * as React from "react";

// Material UI
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import OutlinedInput from "@mui/material/OutlinedInput"
import Paper from "@mui/material/Paper"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert"
import Link from "@mui/material/Link";

// Icon imports
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HomeIcon from '@mui/icons-material/Home';
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from "@mui/icons-material/Check"

// Local imports
import useIsBrowserVisible from "../../hooks/useIsBrowserVisible";
import {useSettings} from "../../settings";
import {jog, home, extrude, selectTool, setFlowrate as printer_setFlowrate, setFeedrate as printer_setFeedrate} from "../../api/printer";
import {sendGcode} from "../../api/control";
import {useProfiles} from "../../settings/printerprofiles";


export default function Control ({isActive}) {
    const settings = useSettings()
    const webcamEnabled = settings.webcam.webcamEnabled

    return (
        <Grid container spacing={2}>
            {webcamEnabled &&
            <Grid item lg={6} md={12}>
                <Webcam isActive={isActive}/>
            </Grid>
            }
            <Grid item lg={6} md={12}>
                <PrintHeadControls />
            </Grid>
            <Grid item lg={6} md={12}>
                <ExtruderControls />
            </Grid>
            <Grid item lg={6} md={12}>
                <FeedFlowControl />
            </Grid>
        </Grid>
    )
}

function Webcam ({isActive}) {
    const isBrowserVisible = useIsBrowserVisible()
    const settings = useSettings()

    const shouldWebcamLoad = isActive && isBrowserVisible  // TODO apparently safari doesn't unload the webcam stream

    const [webcamError, setWebcamError] = React.useState(false)

    const webcamSrc = shouldWebcamLoad ? settings.webcam.streamUrl : undefined

    return (
        <Paper elevation={2} sx={{p: 1, display: 'flex', height: "100%"}}>
            {!webcamError
                ? <img width={"100%"} src={webcamSrc} alt={"Webcam Stream"} onError={() => setWebcamError(true)}/>
                : <Alert variant={"outlined"} severity={"error"}
                         sx={{width: "100%", alignItems: 'center', justifyContent: 'center'}}>
                    <Typography mb={1} variant={"h5"}>Webcam Stream not loaded</Typography>
                    <Typography variant={"body2"}>
                        Currently configured stream URL: <Link href={webcamSrc}>{webcamSrc}</Link>
                    </Typography>
                </Alert>
            }
        </Paper>
    )
}

function PrintHeadControls() {
    const [jogDistance, setJogDistance] = React.useState(1)

    const handleJogSpeedChange = (e, newValue) => {
        if (newValue !== null){
            setJogDistance(newValue)
        }
    }

    const sendJogCommand = (axis, multiplier) => {
        multiplier = multiplier || 1
        const data = {
            [axis]: jogDistance * multiplier // TODO inverting based on printer profile
        }
        jog(data)
    }

    return (
        <Grid container spacing={0} sx={{m: 2}}>
            <ControlColumn>
                <ControlRow>
                    <Typography variant={"h5"}>X/Y</Typography>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => sendJogCommand("y", 1)}><ArrowUpwardIcon/></ControlButton>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => sendJogCommand("x", 1)}><ArrowBackIcon /></ControlButton>
                    <ControlButton onClick={() => home(["x", "y"])} color={"secondary"}><HomeIcon /></ControlButton>
                    <ControlButton onClick={() => sendJogCommand("x", -1)}><ArrowForwardIcon /></ControlButton>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => sendJogCommand("y", -1)}><ArrowDownwardIcon/></ControlButton>
                </ControlRow>
            </ControlColumn>
            <ControlColumn>
                <ControlRow>
                    <Typography variant={"h5"}>Z</Typography>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => sendJogCommand("z", 1)}><ArrowUpwardIcon/></ControlButton>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => home(["z"])} color={"secondary"}><HomeIcon/></ControlButton>
                </ControlRow>
                <ControlRow>
                    <ControlButton onClick={() => sendJogCommand("z", -1)}><ArrowDownwardIcon/></ControlButton>
                </ControlRow>
            </ControlColumn>
            <Grid item xs={12}>
                <JogDistanceControl value={jogDistance} onChange={handleJogSpeedChange} />
            </Grid>
            <ControlRow sx={{justifyContent: 'center', width: '100%', mt: 1}}>
                <ControlButton onClick={() => sendGcode("M18")}>Motors off</ControlButton>
                <ControlButton onClick={() => sendGcode("M106 S255")}>Fan On</ControlButton>
                <ControlButton onClick={() => sendGcode("M106 S0")}>Fan Off</ControlButton>
            </ControlRow>
        </Grid>
    )
}

function ExtruderControls () {
    const [extrusionDistance, setExtrusionDistance] = React.useState("5")

    const [anchorEl, setAnchorEl] = React.useState(null);
    const toolSelectOpen = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToolSelect = (toolNo) => {
        handleClose()
        const toolName = `tool${toolNo}`
        selectTool(toolName)
    }

    const handleDistanceChange = (e) => {
        const value = e.target.value
        setExtrusionDistance(value)
    }

    const extrudeCommand = () => {
        extrude(extrusionDistance)
    }

    const retract = () => {
        extrude(-extrusionDistance)
    }

    const tools = [...Array(useProfiles().profiles._default.extruder.count).keys()] // TODO active profile

    return (
        <Grid container spacing={0} sx={{justifyContent: 'center', "& > div":{mb: 2} }}>
            <ControlRow>
                <Typography variant={"h5"}>Tool (E)</Typography>
            </ControlRow>
            <ControlRow>
                <OutlinedInput
                    type={"number"}
                    size={"small"}
                    endAdornment={
                        <InputAdornment position={"end"}>mm</InputAdornment>
                    }
                    placeholder={"5"}
                    value={extrusionDistance}
                    onChange={handleDistanceChange}
                    sx={{mr: 1, "& > input":{ textAlign: 'right'}}}
                />
                <ControlButton onClick={extrudeCommand}>
                    Extrude
                </ControlButton>
                <ControlButton onClick={retract} color={"secondary"}>
                    Retract
                </ControlButton>
            </ControlRow>
            <ControlRow>
                <Button variant={"contained"} onClick={handleClick} disabled={tools.length <= 1}>
                    Select tool <ArrowDropDownIcon />
                </Button>
                <Menu
                    open={toolSelectOpen}
                    onClose={handleClose}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {tools.map((tool) => (
                        <MenuItem key={tool} onClick={() => handleToolSelect(tool)}>Tool {tool}</MenuItem>
                    ))}
                </Menu>
            </ControlRow>
        </Grid>
    )
}

const FeedFlowControl = () => {
    const [feedrate, setFeedrate] = React.useState("")
    const [flowrate, setFlowrate] = React.useState("")

    const onFeedrateChange = (e) => {
        const value = e.target.value
        setFeedrate(value)
    }

    const onFlowrateChange = (e) => {
        const value = e.target.value
        setFlowrate(value)
    }

    const sendFeedrate = () => {
        printer_setFeedrate(feedrate).then(() => {
            setFeedrate("")
        })
    }

    const sendFlowrate = () => {
        printer_setFlowrate(flowrate).then(() => {
            setFlowrate("")
        })
    }

    return (
        <Grid container spacing={0} sx={{justifyContent: 'center', "& > div":{mb: 2} }}>
            <ControlColumn sx={{"& > div":{mb: 2}}}>
                <ControlRow>
                    <Typography variant={"h5"}>Feed rate modifier</Typography>
                </ControlRow>
                <ControlRow>
                    <OutlinedInput
                        type={"number"}
                        size={"small"}
                        endAdornment={
                            <InputAdornment position={"end"}>%</InputAdornment>
                        }
                        sx={{ml: 1, "& > input":{ textAlign: 'right'}}}
                        value={feedrate}
                        onChange={onFeedrateChange}
                    />
                    <ControlButton onClick={sendFeedrate} disabled={feedrate === ""}>
                        <CheckIcon />
                    </ControlButton>
                </ControlRow>
            </ControlColumn>
            <ControlColumn sx={{"& > div":{mb: 2}}}>
                <ControlRow>
                    <Typography variant={"h5"}>Flow rate modifier</Typography>
                </ControlRow>
                <ControlRow>
                    <OutlinedInput
                        type={"number"}
                        size={"small"}
                        endAdornment={
                            <InputAdornment position={"end"}>%</InputAdornment>
                        }
                        sx={{ml: 1, "& > input":{ textAlign: 'right'}}}
                        value={flowrate}
                        onChange={onFlowrateChange}
                    />
                    <ControlButton onClick={sendFlowrate} disabled={flowrate === ""}>
                        <CheckIcon />
                    </ControlButton>
                </ControlRow>
            </ControlColumn>
        </Grid>
    )
}

const ControlRow = ({children, sx}) =>  (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', ...sx}}>
        {children}
    </Box>
)

const ControlColumn = ({children, sx, ...rest}) => (
    <Grid item sm={12} md={6} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...sx}} {...rest}>
        {children}
    </Grid>
)

const ControlButton = ({onClick, children, ...rest}) => {
    return (
        <Button variant={"contained"} onClick={onClick} sx={{m: 1}} {...rest}>
            {children}
        </Button>
    )
}

const JogDistanceControl = ({value, onChange}) => {
    const buttons = [
        {value: 0.1, label: '0.1mm'},
        {value: 1, label: '1mm'},
        {value: 10, label: '10mm'},
        {value: 100, label: '100mm'}
    ]

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
            <ToggleButtonGroup value={value} exclusive onChange={onChange}>
                {buttons.map((button) => (
                    <ToggleButton key={button.value} value={button.value}>
                        {button.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    )
}
