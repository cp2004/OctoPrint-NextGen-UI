export function get(route, additionalHeaders) {
    if (!route.startsWith(".")){
        route = "." + route
    }
    return fetch(route, {...requestOptions, ...additionalHeaders}).then(response => response.json())
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


const requestOptions = {
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
}

const postOptions = {
    method: 'POST',
    ...requestOptions
}
