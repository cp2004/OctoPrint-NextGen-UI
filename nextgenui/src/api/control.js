import {post} from "./index";

export function sendGcodeWithParameters (commands, parameters, opts){
    commands = commands || [];
    parameters = parameters || {}

    if (typeof commands === "string"){
        commands = [commands]
    }

    return post("./api/printer/command", {commands: commands, parameters: parameters}, opts)
}

export function sendGcode (commands, opts) {
    return sendGcodeWithParameters(commands, undefined, opts)
}
