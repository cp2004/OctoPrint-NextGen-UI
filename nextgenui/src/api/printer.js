import {post} from "./index";

export function issuePrintHeadCommand (command, payload, opts){
    return post("./api/printer/printhead", {...payload, command: command}, opts)
}

export function issueToolCommand (command, payload, opts){
    return post("./api/printer/tool", {...payload, command: command}, opts)
}

export function issueBedCommand (command, payload, opts){
    return post("./api/printer/bed", {...payload, command: command}, opts)
}

export function issueChamberCommand (command, payload, opts){
    return post("./api/printer/chamber", {...payload, command: command}, opts)
}

export function issueSdCommand (command, payload, opts){
    return post("./api/printer/sd", {...payload, command: command}, opts)
}

export function jog (params, opts){
    const payload = {
        absolute: false,
        ...params
    }
    return issuePrintHeadCommand("jog", payload, opts)
}

export function home (axes, opts){
    const payload = {
        axes: [...axes],
    }
    return issuePrintHeadCommand("home", payload, opts)
}

export function setFeedrate (factor, opts){
    const payload = {
        factor: factor || 100
    }
    return issuePrintHeadCommand("feedrate", payload, opts)
}

// TODO for definite: flowrate, extrusion
// TODO temperatures and get commands if necessary
