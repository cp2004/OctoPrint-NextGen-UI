import * as React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {useSocket} from "../../client/socketClient";
import {useProfiles} from "../../settings/printerprofiles";
import ListItem from "@material-ui/core/ListItem";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import CircleIcon from '@material-ui/icons/Circle';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {IconButton, InputAdornment, ListItemText, OutlinedInput, Paper, Table, TextField, chipClasses} from "@material-ui/core";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CheckIcon from '@material-ui/icons/Check';

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


export default function Temperature (props) {
    const [tempData, setTempData] = React.useState([])

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

    return (
        <Box>
            <TempGraph
                tempData={tempData}
                tools={tools}
            />
            <TempControls tempData={tempData} tools={tools}/>
        </Box>
    )
}

function TempGraph ({tempData, tools}) {

    const actualLines = tools.map(({key, name}, index) =>
        <Line key={"actual-" + key} type="monotone" dataKey={key + ".actual"} stroke={actualColors[index]}
              dot={false} isAnimationActive={false}/>
    )

    const targetLines = tools.map(({key, name}, index) =>
        <Line key={"target-" + key} type="monotone" dataKey={key + ".target"} stroke={targetColors[index]}
              dot={false} strokeDasharray="3 3" isAnimationActive={false}/>
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

    return (
        <Box sx={{mr: 2}}> {/* Make the graph look more in the centre*/}
            <ResponsiveContainer width="100%" aspect={2}>
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
                    {actualLines}
                    {targetLines}
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
    // This needs to be as performant as possible, since when hovering it is re-rendered loads
    // TODO reduce CPU usage of tooltip, which is quite high even with animations disabled
    // Initial suspicions:
    // * MUI/Emotion's `sx` prop is causing a lot of overhead - doesn't seem to be, the classnames are stable
    // * MUI components are slower to render than basic HTML
    // -> Do we really need to use `ListItem`s? Could use a styled co
    // Recharts is positioning this as an SVG and is calculating this using extreme accuracy. This probably isn't necessary.
    // Looking at
    if (active && payload && payload.length){
        const time = new Date(0)
        time.setUTCSeconds(parseInt(label, 10))
        const timeLabel = time.toLocaleTimeString().split(" ")[0]

        return (
            <Paper elevation={1}>
                <List dense>
                    <ListItem>
                        <ListItemText><strong>{timeLabel}</strong></ListItemText>
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
    const entries = tools.map(({key, name}, index) => {
        const actual = tempData.length && tempData[tempData.length - 1][key] ? tempData[tempData.length - 1][key]["actual"] : 0
        const target = tempData.length && tempData[tempData.length - 1][key] ? tempData[tempData.length - 1][key]["target"] : 0

        return (
            <React.Fragment key={key}>
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
                        value={target}
                        sx={{'& .MuiOutlinedInput-input': {textAlign: 'center'}}}
                        startAdornment={
                            <IconButton size={"small"} variant={"contained"} color={"secondary"} title={"Decrease target"}>
                                <RemoveIcon />
                            </IconButton>
                        }
                        endAdornment={
                            <>
                                <InputAdornment position={"end"}>°C</InputAdornment>
                                <IconButton size={"small"} variant={"contained"} color={"secondary"} title={"Decrease target"}>
                                    <AddIcon />
                                </IconButton>
                            </>
                        }
                    />
                    <Button variant={"outlined"} sx={{ml: 1, height: "100%"}}>
                        <CheckIcon />
                    </Button>
                </Grid>
                <Grid item xs={5} />
            </React.Fragment>
    )})

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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
