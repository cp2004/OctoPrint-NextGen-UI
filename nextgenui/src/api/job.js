import {issueCommand, get as httpGet} from "./index";


const url = "/api/job"

export function issueJobCommand (command, payload, opts) {
    if (arguments.length === 2) {
        opts = payload
        payload = {}
    }

    return issueCommand(url, command, payload, opts)
}

export function get (opts) {
    return httpGet(url, opts)
}

export function start (opts) {
    return issueJobCommand("start", opts)
}

export function restart (opts) {
    return issueJobCommand("restart", opts)
}

export function pause (opts) {
    return issueJobCommand("pause", {action: pause}, opts)
}

export function resume (opts) {
    return issueJobCommand("pause", {action: "resume"}, opts)
}

export function togglePause (opts) {
    return issueJobCommand("pause", {action: "toggle"}, opts)
}

export function cancel (opts) {
    return issueJobCommand("cancel", opts)
}
