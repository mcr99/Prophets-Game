import { useState } from "react";

export default function useFetch(baseUrl, token = null) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
    }

    async function request(method, url, body = null) {
        setLoading(true)
        setError(null)
        try {
            const resp = await fetch(baseUrl + url, {
                method,
                headers,
                ...(body && { body: JSON.stringify(body) })
            })
            if (!resp.ok) throw new Error(`Error ${resp.status}: ${resp.statusText}`)
            const json = await resp.json()
            setData(json)
            return json
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        data, loading, error,
        get:    (url)         => request("GET",    url),
        post:   (url, body)   => request("POST",   url, body),
        put:    (url, body)   => request("PUT",    url, body),
        delete: (url)         => request("DELETE", url),
    }
}
