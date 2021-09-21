export function get(route, additionalHeaders) {
    if (!route.startsWith(".")){
        route = "." + route
    }
    return fetch(route, {...requestOptions, ...additionalHeaders}).then(response => response.json())
}

export function getWithData(route, content, opts) {
    const paramString = new URLSearchParams({...content}).toString()

    route = route + "?" + paramString

    return get(route, opts)
}

export function post(route, content, additionalHeaders) {
    if (!route.startsWith(".")){
        route = "." + route
    }
    return fetch(route, {
        body: JSON.stringify(content),
        ...postOptions,
        ...additionalHeaders
    })
}

export function issueCommand (url, command, payload, opts) {
    payload = payload || {}

    const data = {
        ...payload,
        command: command
    }
    return post(url, data, opts)
}


const requestOptions = {
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
}

const postOptions = {
    method: 'POST',
    ...requestOptions
}
