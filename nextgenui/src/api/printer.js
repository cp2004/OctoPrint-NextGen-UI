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
        factor: parseInt(factor) || 100
    }
    return issuePrintHeadCommand("feedrate", payload, opts)
}

export function setFlowrate (factor, opts){
    const payload = {
        factor: parseInt(factor) || 100
    }

    return issueToolCommand("flowrate", payload, opts)
}

export function extrude (amount, opts){
    const payload = {
        amount: parseInt(amount) || 5  // Leaving this as undefined
    }

    return issueToolCommand("extrude", payload, opts)
}

export function selectTool (tool, opts){
    const payload = {
        tool: tool || undefined
    }

    return issueToolCommand("select", payload, opts)
}

// TODO temperatures and get commands if necessary
