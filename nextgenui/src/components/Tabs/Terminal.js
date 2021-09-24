import * as React from "react"

import {styled} from "@mui/material/styles";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper"
import FormControlLabel from "@mui/material/FormControlLabel"
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip"
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import {Virtuoso} from "react-virtuoso";
import copy from 'copy-to-clipboard'
import {nanoid} from "nanoid/non-secure"

import {useSocket} from "../../api/socket";
import {sendGcode} from "../../api/control";

const TerminalContainer = styled(List)({
    height: "480px",  // 20 * 24, 24px is the height of each line
    paddingTop: 0,
    paddingBottom: 0,
})

export default function Terminal ({isActive}) {
    const [autoscroll, setAutoscroll] = React.useState(true)
    const [logLines, setLogLines] = React.useState([]);
    const [printerState, setPrinterState] = React.useState({
            operational: undefined,
            paused: undefined,
            printing: undefined,
            pausing: undefined,
            cancelling: undefined,
            sdReady: undefined,
            error: undefined,
            ready: undefined,
            closedOrError: undefined,
    })

    const processData = (msg) => {
        const data = msg.history ? msg.history : msg.current
        const logs = data.logs;
        const stateFlags = data.state.flags

        setLogLines(prevState => prevState.concat(logs.map(log => toInternalFormat(log))).slice(autoscroll ? -300 : -1500))
        setPrinterState(stateFlags)
    }

    useSocket("history", processData)
    useSocket("current", processData)

    const handleDisableAutoScroll = () => {
        setAutoscroll(false)
    }

    return (
        <>
            <Paper elevation={2}>
                <TerminalContainer>
                    <TerminalLog logs={logLines} autoscroll={autoscroll} isVisible={isActive} disableAutoScroll={handleDisableAutoScroll}/>
                </TerminalContainer>
                <TerminalInput printerState={printerState} />
            </Paper>
            <TerminalControls autoscroll={autoscroll} setAutoScroll={setAutoscroll} logLines={logLines} clear={() => setLogLines([])} />
        </>
    )
}

function TerminalLog ({logs, autoscroll, isVisible, disableAutoScroll}) {
    // TODO performance - don't waste time when component is not visible
    const content = (index) => {
        const line = logs[index]
        return (
            <ListItem key={line.id} sx={{py: 0}}>
                <ListItemText sx={{my: 0, "&> span": {fontFamily: 'monospace'}}}>
                    {line.line}
                </ListItemText>
            </ListItem>
        )
    }

    const virtuoso_term = React.useRef(null)

    const [prevScrollTop, setPrevScrollTop] = React.useState(0)

    // Autoscroll to bottom if not at the bottom (& supposed to autoscroll)
    React.useEffect(() => {
        if (autoscroll && isVisible) {
            virtuoso_term.current.scrollToIndex({
                index: logs.length,
                align: 'end',
                behaviour: 'auto'
            })
        }
    }, [virtuoso_term, logs, autoscroll, isVisible])

    const handleScroll = (event) => {  // TODO throttle callback? - scroll can be called a lot
        const scrollTop = event.target.scrollTop
        if ((prevScrollTop - scrollTop) > 30){
            // disableAutoScroll()  // TODO need to not do this if the switch has just been pushed otherwise works great
        }
        setPrevScrollTop(scrollTop)
    }

    return (
        <Virtuoso
            ref={virtuoso_term}
            totalCount={logs.length}
            itemContent={content}
            followOutput={autoscroll}
            alignToBottom
            onScroll={handleScroll}
        />
    )
}

function TerminalInput (props) {
    const {printerState} = props

    // Heavily based on OctoPrint's core UI logic
    const commandRegex = /^(([gmt][0-9]+)(\.[0-9+])?)(\s.*)?/i

    const [command, setCommand] = React.useState("")
    const [history, setHistory] = React.useState([])
    const [historyIndex, setHistoryIndex] = React.useState(0)

    const handleChange = (e) => {
        const value = e.target.value
        setCommand(value)
    }

    const handleKeyUp = (e) => {
        if (e.keyCode === 13) {
            // Enter to send
            handleSend()
        }
    }

    const handleKeyDown = (e) => {
        const keyCode = e.keyCode
        const changeIndex = (offset) => {
            const newHistoryIndex = historyIndex + offset
            const newCommand = history[newHistoryIndex]
            setHistoryIndex(newHistoryIndex)
            setCommand(newCommand)
        }
        if (keyCode === 38 || keyCode === 40) {
            if (keyCode === 38 && history.length > 0 && historyIndex > 0) {
                changeIndex(-1)
            } else if (keyCode === 40 && historyIndex < history.length - 1) {
                changeIndex(1)
            }
            // TODO not needed - done above?
            if (historyIndex >= 0 && historyIndex < history.length){
                // setCommand(history[historyIndex])
            }

            // prevent the cursor from being moved to the beginning of the input field (this is actually the reason
            // why we do the arrow key handling in the keydown event handler, keyup would be too late already to
            // prevent this from happening, causing a jumpy cursor)
            e.preventDefault();
        }
    }

    const handleSend = () => {
        if (!command) return

        let commandToSend = command;
        let commandMatch = commandToSend.match(commandRegex)
        if (commandMatch !== null){
            // let fullCode = commandMatch[1].toUpperCase(); // full code incl. sub code
            // let mainCode = commandMatch[2].toUpperCase(); // main code only without sub code

            commandToSend = commandToSend.toUpperCase();

            // TODO blacklist functionality - requires settings
            // copied here from OctoPrint's terminal view model, but we have no settings so it can't be implemented yet
            /*if (
                self.blacklist.indexOf(mainCode) < 0 &&
                self.blacklist.indexOf(fullCode) < 0
            ) {
                // full or main code not on blacklist -> upper case the whole command
                commandToSend = commandToSend.toUpperCase();
            } else {
                // full or main code on blacklist -> only upper case that and leave parameters as is
                commandToSend =
                    fullCode + (commandMatch[4] !== undefined ? commandMatch[4] : "");
            }*/
        }

        if (commandToSend) {
            sendGcode(commandToSend).then(() => {
                setHistory(prevState => {
                    // Feels like some kind of hack to avoid race conditions
                    setHistoryIndex(prevState.length < 300 ? prevState.length + 1 : 300)
                    // Set a sane limit on number of commands to be saved
                    return prevState.concat([command]).slice(-300)
                })
                setCommand("")
            })
        }
    }

    const ready = printerState.ready

    return (
        <OutlinedInput
            value={command}
            fullWidth
            size={"small"}
            sx={{mt: "2px", fontFamily: "monospace"}}
            placeholder={ready ? "Enter a command" : "Printing..."}
            endAdornment={
                <Button variant={"contained"} startIcon={<SendIcon />} disabled={command === ""}>
                    Send
                </Button>
                }
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={!ready}
        />
    )
}

function TerminalControls ({autoscroll, setAutoScroll, logLines, clear}){

    const handleChange = (e) => {
        const checked = e.target.checked
        setAutoScroll(checked)
    }

    const [copyShow, setCopyShow] = React.useState(false)
    const copyTimer = React.useRef(null)
    const [clearShow, setClearShow] = React.useState(false)
    const clearTimer = React.useRef(null)


    const handleCopy = () => {
        copy(logLines.map(line => line.line).join("\n"))
        setCopyShow(true)
        clearTimeout(copyTimer.current)
        copyTimer.current = setTimeout(() => {
            setCopyShow(false)
        }, 750)
    }

    const handleClear = () => {
        clear()
        setClearShow(true)
        clearTimeout(clearTimer.current)
        clearTimer.current = setTimeout(() => {
            setClearShow(false)
        }, 750)
    }

    return (
        <Box display={"flex"} justifyContent={"space-between"} sx={{px: 2}} alignItems={"center"}>
            <FormControlLabel control={<Switch checked={autoscroll} onChange={handleChange} />} label={"Autoscroll"} />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: {md: 'row', xs: 'column'},
                    "&> *": {px: 2, py: {sm: 2}}
                }}
            >
                <Typography>Showing {logLines.length} lines</Typography>
                <Tooltip title={"Copied!"} open={copyShow} >
                    <Button onClick={handleCopy} startIcon={<ContentCopyIcon />}>Copy all</Button>
                </Tooltip>
                <Tooltip title={"Cleared!"} open={clearShow}>
                    <Button onClick={handleClear} startIcon={<DeleteForeverIcon />}>Clear all</Button>
                </Tooltip>
            </Box>
        </Box>
    )
}

const toInternalFormat = (line, display, type) => {
    display = display || "line"

    if (type === undefined){
        if (line.startsWith("Recv")){
            type = "recv";
        } else if (line.startsWith("Send")) {
            type = "send";
        } else if (line.startsWith("Warn")) {
            type = "warn";
        }
    }

    return {
        line: escapeUnprintableCharacters(line),
        id: nanoid(7),
        display: display,
        type: type,
    }
}

/**
 * Escapes unprintable ASCII characters in the provided string.
 *
 * E.g. turns a null byte in the string into "\x00".
 *
 * Characters 0 to 31 excluding 9, 10 and 13 will be escaped, as will
 * 127, 128 to 159 and 255. That should leave printable characters and unicode
 * alone.
 *
 * Originally based on
 * https://gist.github.com/mathiasbynens/1243213#gistcomment-53590
 * Found via OctoPrint's source code, https://github.com/OctoPrint/OctoPrint/blob/5700695ef31349d677237fc1a61dd1017fafaefa/src/octoprint/static/js/app/helpers.js#L1494-L1531
 *
 * @param str The string to escape
 * @returns {string}
 */
const escapeUnprintableCharacters = (str) => {
    let result = "";
    let index = 0;
    let charCode;

    while (!isNaN((charCode = str.charCodeAt(index)))) {
        if (
            (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) ||
            charCode === 127 ||
            (charCode >= 128 && charCode <= 159) ||
            charCode === 255
        ) {
            // special hex chars
            result += "\\x" + (charCode > 15 ? "" : "0") + charCode.toString(16);
        } else {
            // anything else
            result += str[index];
        }
        index++;
    }
    return result;
};
