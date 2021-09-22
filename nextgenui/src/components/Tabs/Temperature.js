import * as React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {useSocket} from "../../client/socketClient";
import {useProfiles} from "../../settings/printerprofiles";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {IconButton, InputAdornment, ListItemText, OutlinedInput, Paper, chipClasses} from "@mui/material";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CheckIcon from '@mui/icons-material/Check';

const actualColors = [
    "blue",
    "red",
    "orange",
    "green",
    "brown",
    "purple"
]

// TODO support for max number of heaters, just need more colours...
const targetColors = [
    "#8080ff",
    "rgba(255,128,128,1)",
    "#fed280"
]


export default function Temperature ({isActive}) {
    const [tempData, setTempData] = React.useState([])

    const printerProfile = useProfiles().profiles._default  // TODO support for actual 'active' profile

    const numExtruders = printerProfile.extruder.count
    const hasBed = printerProfile.heatedBed
    const hasChamber = printerProfile.heatedChamber


    const tools = [
        ...(hasBed ? [{key: 'bed', name: 'Bed'}] : []),
        ...(hasChamber ? [{key: 'chamber', name: 'Chamber'}]: []),
        ...([...Array(numExtruders).keys()].map((extruder) => ({
            key: `tool${extruder}`,
            name: `Tool ${extruder}`,
        })))
    ]

    const socketHandler = (msg) => {
        const data = msg.current ? msg.current : msg.history
        const temps = data.temps
        if (temps.length) {
            setTempData(
                prevState =>
                    prevState.concat(temps).slice(-600)  // TODO respect temp graph cutoff setting
            )
        }
    }
    useSocket("current", socketHandler)
    useSocket("history", socketHandler)

    return (
        <>
            <TempGraph
                tempData={tempData}
                tools={tools}
                isActive={isActive}
            />
            <TempControls tempData={tempData} tools={tools}/>
        </>
    )
}

const tempLineProps = {
    type: 'monotone',
    dot: false,
    isAnimationActive: false,
    strokeWidth: 2,
}

function TempGraph ({tempData, tools, isActive}) {

    const actualLines = tools.map(({key, name}, index) =>
        <Line
            key={"actual-" + key}
            dataKey={key + ".actual"}
            stroke={actualColors[index]}
            {...tempLineProps}
        />
    )

    const targetLines = tools.map(({key, name}, index) =>
        <Line
            key={"target-" + key}
            dataKey={key + ".target"}
            stroke={targetColors[index]}
            strokeDasharray="3 3"
            {...tempLineProps}
        />
    )

    const tempFormatter = (value) => value + "°C"
    const timeFormatter = (value) => {
        if (value === undefined || value === 0 || isNaN(value)) return ""; // we don't want to display the minutes since the epoch if not connected yet ;)

        // value is in seconds
        const current = Math.round(Date.now() / 1000)  // secs
        const diff = current - value  // secs
        const diffInMins = Math.round(diff / 60)

        if (diffInMins === 0) {
            // don't write anything for "just now"
            return "now";
        } else if (diffInMins < 0) {
            // we can't look into the future
            return "";
        } else {
            return "-" + diffInMins + " min";
        }
    }

    if (!isActive) return null; // TODO minor hang when switching views, but probably better overall performance
    // Since the graph is not updating in the background but we just keep holding state
    // If possible, could stop rendering, but keep updating data? componentShouldUpdate style

    return (
        <Box sx={{mr: 2}}> {/* Make the graph look more in the centre*/}
            <ResponsiveContainer width={isActive ? "100%" : "100px"} aspect={2}>
                <LineChart
                    width={500}
                    height={300}
                    data={tempData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <XAxis tickFormatter={timeFormatter} dataKey="time"/>
                    <YAxis tickFormatter={tempFormatter} />
                    <Tooltip content={TempTooltip} isAnimationActive={false} />
                    <Legend content={TempLegend}/>
                    {targetLines}{/* This way around looks best for the graph, but now tooltip & legend are backwards */}
                    {actualLines}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

const TempLegend = ({payload}) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0.5,
            m: 0
        }}>
            {payload.map((item) => {
                const labelSplit = item.dataKey.split(".")
                const label = capitalizeFirstLetter(labelSplit[0]) + " " + capitalizeFirstLetter(labelSplit[1])
                return (
                    <Chip
                        variant={"outlined"}
                        sx={{mx: 1, [`& .${chipClasses.icon}`]: {
                                color: item.color
                            }}}
                        key={item.dataKey}
                        label={label}
                        color={"primary"}
                        icon={<CircleIcon />}
                    />
                )
            })}
        </Box>
    )
}

const TempTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length){
        const time = new Date(0)
        time.setUTCSeconds(parseInt(label, 10))
        const timeLabel = time.toLocaleTimeString().split(" ")[0]

        return (
            <Paper elevation={1}>
                <List dense>
                    <ListItem>
                        <ListItemText><strong>Time: {timeLabel}</strong></ListItemText>
                    </ListItem>
                    {payload.map((item) => {
                        const labelSplit = item.dataKey.split(".")
                        const label = `${capitalizeFirstLetter(labelSplit[0])} ${capitalizeFirstLetter(labelSplit[1])}: ${item.value}°C`
                        return (
                            <ListItem key={item.dataKey}>
                                <ListItemText style={{color: item.color}}>{label}</ListItemText>
                            </ListItem>
                        )}
                    )}
                </List>
            </Paper>
        )
    }
    return null;
}

function TempControls ({tempData, tools}) {
    const entries = tools.map(({key, name}) => (
        <SingleControl key={name} tempData={tempData} toolKey={key} name={name} />
    ))

    return (
        <Paper variant={"outlined"} sx={{my: 1, mx: 4, p: 2}}>
            <Grid container rowSpacing={3} columnSpacing={1} sx={{"& .MuiGrid-item": {display: 'flex', justifyContent: 'center', 'alignItems': 'center'}}}>
                {/* Row 1 */}
                <Grid item xs={1} />
                <Grid item xs={2}>
                    <Typography>
                        Actual
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography>
                        Target
                    </Typography>
                </Grid>
                <Grid item xs={5}>
                    Offset
                </Grid>
                {entries}
            </Grid>
        </Paper>
    )
}

function SingleControl ({tempData, toolKey, name}){
    const [targetValue, setTargetValue] = React.useState("1")
    const [newTarget, setNewTarget] = React.useState("")

    const actual = tempData.length && tempData[tempData.length - 1][toolKey] ? tempData[tempData.length - 1][toolKey]["actual"] : 0
    const target = tempData.length && tempData[tempData.length - 1][toolKey] ? tempData[tempData.length - 1][toolKey]["target"] : 0

    React.useEffect(() => {
        // Set target state whenever the tempData is updated
        // To show as a placeholder when nothing is being done
        setTargetValue(String(target))
    }, [setTargetValue, target])

    const onTargetChange = (event) => {
        // Handle changing the target nicely, checking validity
        let value = event.target.value

        if (value !== ""){
            // If the value is not empty, it must be a number, so abort if it is anything else
            // "" is the only allowed non-number state, like nothing - but setting to undefined makes
            // the component uncontrolled which is not what we want
            try {
                value = parseInt(event.target.value, 10);

                if (isNaN(value)) {
                    // Not a number? don't update
                    return;
                }
            } catch (e) {
                return // If it can't be parsed to int, don't update
            }

            // Do nothing if out of range
            if (!(0 <= value && value <= 999)) {
                return
            }
        }

        setNewTarget(value)
    }

    const onTargetKeyDown = (event) => {
        // Handle enter to send here
        if (event.keyCode === 13){
            saveChange()
            event.target.blur()
        }
    }

    const onFocus = (event) => {
        if (newTarget === ""){
            setNewTarget(target)
        }
        setTimeout(() => {
            event.target.select()
        }, 0)
    }

    const changeTarget = (difference) => {
        setNewTarget(prevState => {
            let newValue
            if (prevState === "") {
                // Empty string means 'no value' so start at the current target from the server
                newValue = target + difference
            } else {
                // Add to the current 'new value
                newValue = newTarget + difference
            }

            // Abort any changes if that is out of bounds
            if (!(0 <= newValue && newValue <= 999)) return prevState

            return newValue
        })
    }

    const increaseTarget = () => {
        changeTarget(1)
    }

    const decreaseTarget = () => {
        changeTarget(-1)
    }

    const saveChange = () => {
        const value = newTarget

        try {
            parseInt(value)
        } catch (e) {
            // Abort if not number - shouldn't happen, but if it does just fail silently
            return
        }

        const resetChange = () => {
            // Small hack to avoid delays between setting the target and it appearing in the box from socket
            setTargetValue(parseInt(value, 10))
            setNewTarget("")
        }

        if (toolKey === "bed") {
            setBedTarget(value).then(resetChange)
        } else if (toolKey === "chamber") {
            setChamberTarget(value).then(resetChange)
        } else {
            setToolTarget(value, toolKey).then(resetChange)
        }
    }

    return (
        <>
            <Grid item xs={1}>
                <Typography fontWeight={"bold"}>
                    {name}
                </Typography>
            </Grid>
            <Grid item xs={2}>
                {actual}
            </Grid>
            <Grid item xs={4}>
                <OutlinedInput
                    size={"small"}
                    value={newTarget}
                    placeholder={target === 0 ? 'off' : targetValue}
                    sx={{'& .MuiOutlinedInput-input': {textAlign: 'center'}}}
                    startAdornment={
                        <IconButton
                            size={"small"}
                            variant={"contained"}
                            color={"secondary"}
                            title={"Decrease target"}
                            onClick={decreaseTarget}
                        >
                            <RemoveIcon />
                        </IconButton>
                    }
                    endAdornment={
                        <>
                            <InputAdornment position={"end"}>°C</InputAdornment>
                            <IconButton
                                size={"small"}
                                variant={"contained"}
                                color={"secondary"}
                                title={"Increase target"}
                                onClick={increaseTarget}
                            >
                                <AddIcon />
                            </IconButton>
                        </>
                    }
                    onChange={onTargetChange}
                    onKeyDown={onTargetKeyDown}
                    onFocus={onFocus}
                />
                <Button
                    variant={"outlined"}
                    sx={{ml: 1, height: "100%"}}
                    onClick={saveChange}
                    disabled={newTarget === ""}
                    title={"Save"}
                >
                    <CheckIcon />
                </Button>
            </Grid>
            <Grid item xs={5} />
        </>
    )
}


/*
 * API methods for setting temperatures
 */

function setBedTarget (target) {
    return apiPost("/api/printer/bed", {
        command: "target",
        target: target,
    })
}

function setChamberTarget (target) {
    return apiPost("/api/printer/chamber", {
        command: "target",
        target: target
    })
}

function setToolTarget (target, toolKey) {
    return apiPost("/api/printer/tool", {
        command: "target",
        targets: {
            [toolKey]: target
        }
    })
}

/*
 * Utils
 */

function apiPost (route, data) {
    return fetch(route, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"}
    ).catch(error => console.log(error))
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
