import {get, post, issueCommand} from "./index"

const url = "/api/connection"

export function getSettings (opts) {
    return get(url, opts)
}

export function connect (data, opts) {
    return issueCommand(url, "connect", data || {}, opts)
}

export function disconnect (opts) {
    return issueCommand(url, "disconnect", {}, opts)
}

export function fakeAck (opts) {
    issueCommand(url, "fake_ack", {}, opts)
}
