export function get(route, additionalHeaders) {
    if (route.startsWith("/")){
        route = "." + route
    }
    return fetch(route, {...requestOptions, ...additionalHeaders}).then((response) => {
        if (!response.ok){
            throw Error(response.statusText)
        }
        return response
    }).then(response => response.json())
}

export function getWithData(route, content, opts) {
    if (content){
        const paramString = new URLSearchParams({...content}).toString()

        route = route + "?" + paramString
    }

    return get(route, opts)
}

export function post(route, content, additionalHeaders) {
    if (route.startsWith("/")){
        route = "." + route
    }
    return fetch(route, {
        body: JSON.stringify(content),
        ...postOptions,
        ...additionalHeaders
    })
}


// TODO fix naming - delete is reserved, doesn't fit with the rest
export function httpDelete(route, opts){
    if (route.startsWith("/")){
        route = "." + route
    }
    return fetch(route, {
        method: 'DELETE',
        ...requestOptions,
        ...opts
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

export const createBulkDownloadUrl = (url, files) => {
    return url + "?files=" + files.map(file => encodeURIComponent(file)).join("&")
}
