import {post as httpPost, get as httpGet, getWithData, issueCommand} from "./index"

const url = "/api/files"
const downloadUrl = "/downloads/files"

const resourceForLocation = (location) => url + "/" + location

const downloadForLocation = (location) => downloadUrl + "/" + location

const downloadForEntry = (location, filename) => downloadForLocation(location) + "/" + filename

const resourceForEntry = (location, filename) => resourceForLocation(location) + "/" + filename

// TODO verify if this is needed in my implementation
const preProcessList = (response) => {
}

export function get (location, entryname, opts) {
    return httpGet(resourceForEntry(location, entryname), opts)
}

export function list (recursively, force, opts) {
    recursively = recursively || false;
    force = force || false;

    const query = {}
    if (recursively) {
        query.recursive = recursively
    }
    if (force) {
        query.force = force
    }

    return getWithData(url, query, opts)  // .then(preProcessList)
}

export function listForLocation (location, recursive, opts) {
    recursive = recursive || false
    return getWithData(resourceForLocation(location), {recursive: recursive}, opts)  // .then(preProcessList)
}

export function issueEntryCommand (location, entryname, command, data, opts) {
    const url = resourceForEntry(location, entryname)
    return issueCommand(url, command, data, opts)
}
