class OctoPrintClient {
    constructor(opts) {
        this.baseurl = opts.baseurl || undefined
        this.apikey = opts.apikey || undefined
        this.locale = opts.locale || undefined
    }

    getBaseURl = () => {
        let url = this.baseurl;
        if (url.endsWith("/")){
            url = url + "/";
        }
        return url;
    }

    getRequestHeaders = (additional) => {
        const headers = additional || {}
        if (this.apikey){
            headers["X-Api-Key"] = this.apikey
        }
        if (this.options.locale !== undefined) {
            headers["X-Locale"] = this.locale
        }
        return headers
    }

    fetch = (method, url, opts) => {
        opts = {
            method: method || "GET",
            credentials: "include",
            ...opts,
            headers: this.getRequestHeaders(opts.headers),
        }

        url = opts.url || url || ""

        let urlToCall = url;
        if (!url.startsWith("http://") && !url.startsWith("https://")){
            urlToCall = this.getBaseURl() + url;
        }

        return fetch(urlToCall, opts)
    }

    fetchWithBody = (method, url, body, opts) => {
        return this.fetch(method, url, {
            body: body,
            ...opts
        })
    }

    get = (url, opts) => {
        return this.fetch("GET", url, opts)
    }

    getWithQuery = (url, query, opts) => {
        const params = new URLSearchParams(query)
        return this.fetchWithBody("GET", url, params, opts)
    }

    post = (url, data, opts) => {
        return this.fetchWithBody("POST", url, data, noCache(opts))
    }

    postForm = (url, data, opts) => {
        const form = new FormData();
        data.forEach((value, key) => {
            form.append(key, value)
        })

        return this.post(url, form, contentTypeFalse(opts))
    }

}


const noCache = (opts) => {
    return {
        ...opts,
        headers: {
            ...opts.headers,
            "Cache-Control": "no-cache",
        }
    }
}

const contentTypeFalse = (opts) => {
    return {
        ...opts,
        contentType: false,
    }
}


export default OctoPrintClient
