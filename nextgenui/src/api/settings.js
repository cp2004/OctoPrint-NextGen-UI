import {get as httpGet, post as httpPost} from "./index"

export function get (opts) {
    return httpGet("./api/settings", opts)
}

export function save (settings, opts){
    return httpPost("./api/settings", settings || {}, opts)
}

export function generateApiKey (opts) {
    return httpPost("./api/settings/apikey", opts)
}
