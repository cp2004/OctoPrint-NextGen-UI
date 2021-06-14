import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {Paper, ToggleButton, ToggleButtonGroup} from "@material-ui/core";
import Button from "@material-ui/core/Button";

// Local imports
import useIsBrowserVisible from "../../hooks/useIsBrowserVisible";
import {useSettings} from "../../settings";
import {jog, home} from "../../api/printer";

// Icon imports
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import HomeIcon from '@material-ui/icons/Home';
import Typography from "@material-ui/core/Typography";

export default function Control ({isActive}) {
    return (
        <Grid container spacing={2}>
            <Grid item lg={6} md={12}>
                <Webcam isActive={isActive} />
            </Grid>
            <Grid item lg={6} md={12}>
                <Controls />
            </Grid>
        </Grid>
    )
}

function Webcam ({isActive}) {
    const isBrowserVisible = useIsBrowserVisible()
    const shouldWebcamLoad = isActive && isBrowserVisible  // TODO apparently safari doesn't unload the webcam stream

    const settings = useSettings()

    const webcamSrc = shouldWebcamLoad ? settings.webcam.streamUrl : undefined


    return (
        <Paper elevation={2} sx={{p: 1, display: 'flex'}}>
            <img width={"100%"} src={webcamSrc} alt={"Webcam Stream"}/>
        </Paper>
    )
}

function Controls() {
    const [jogDistance, setJogDistance] = React.useState(1)

    const handleJogSpeedChange = (e, newValue) => {
        setJogDistance(newValue)
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
                <ControlColumn>
                    <ControlButton onClick={() => home(["z"])} color={"secondary"}><HomeIcon/></ControlButton>
                </ControlColumn>
                <ControlColumn>
                    <ControlButton onClick={() => sendJogCommand("z", -1)}><ArrowDownwardIcon/></ControlButton>
                </ControlColumn>
            </ControlColumn>
            <Grid item xs={12}>
                <JogControl value={jogDistance} onChange={handleJogSpeedChange} />
            </Grid>
        </Grid>

    )
}

const ControlRow = ({children}) =>  (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
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
        <Button variant={"contained"} onClick={onClick} sx={{m: 2}} {...rest}>
            {children}
        </Button>
    )
}

const JogControl = ({value, onChange}) => {
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
