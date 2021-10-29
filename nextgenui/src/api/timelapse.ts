import {get as httpGet, getWithData, post as httpPost, httpDelete, createBulkDownloadUrl} from "./index";

const url = "/api/timelapse"
const bulkDownloadUrl = "downloads/timelapses"

const timelapseUrl = (filename: string) => (url + "/" + filename)

// const unrenderedTimelapseUrl = (name: string) => (url + "/unrendered/" + name)


export interface TimelapseList {
    config: DisabledConfig | ZChangeConfig | TimedConfig;
    files: TimelapseRenderedList;
    unrendered?: TimelapseUnrenderedList;
}

interface TimelapseRenderedList {
    name: string;
    size: string
    bytes: number;
    date: string
    url: string
}

interface TimelapseUnrenderedList {
    name: string;
    size: string;
    bytes: number;
    date: string;
    recording: boolean;
    rendering: boolean;
    processing: boolean
}

interface DisabledConfig {
    type: "off"
}

interface ZChangeConfig {
    type: "zchange"
    postRoll: number;
    fps: number;
    retractionZHop: number;
    minDelay: number;
}

interface TimedConfig {
    type: "timed";
    postRoll: number;
    fps: number;
    interval: number;
}

export function get (unrendered: boolean, opts: object): Promise<TimelapseList> {
    if (unrendered){
        return getWithData(url, {unrendered: unrendered}, opts)
    }
    else {
        return httpGet(url, opts)
    }
}

export function saveConfig(config: object, opts: object) {
    return httpPost(url, config || {} , opts)
}

export function deleteTimelapse (filename: string, opts: object) {
    return httpDelete(timelapseUrl(filename), opts)
}

export function bulkDownloadTimelapse (files: string[]) {
    return createBulkDownloadUrl(bulkDownloadUrl, files)
}
