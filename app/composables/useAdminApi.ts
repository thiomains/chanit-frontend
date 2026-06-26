export function useAdminApi() {
    const config = useRuntimeConfig()
    const sessionState = useState('session') as any

    function headers(): Record<string, string> {
        const session = sessionState.value?.session
        if (!session) return {}
        return {
            Authorization: `Bearer ${session.accessToken}`,
            Session: session.sessionId,
        }
    }

    async function get(path: string, options?: Record<string, any>) {
        return await $fetch(config.public.apiBaseUrl + path, {
            method: 'GET',
            headers: headers(),
            ...options,
        })
    }

    async function post(path: string, body: any, options?: Record<string, any>) {
        return await $fetch(config.public.apiBaseUrl + path, {
            method: 'POST',
            headers: {
                ...headers(),
                'Content-Type': 'application/json',
            },
            body,
            ...options,
        })
    }

    return { get, post }
}
