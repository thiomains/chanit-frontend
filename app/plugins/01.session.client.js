export default defineNuxtPlugin(async () => {

    const nuxtApp = useNuxtApp()

    const session = useState('session', () => ({
        session: null,
        user: null,
    }))
    const config = useRuntimeConfig()

    async function connect() {
        const sessionRes = await refreshSession()
        if (sessionRes.error) {
            if (sessionRes.error.status === 401) {
                await navigateTo({
                    path: '/login'
                })
                window.location.reload()
                return
            }
            return
        }
        session.value.session = sessionRes
        const meRes = await refreshUser()
        if (meRes.error) {
            if (meRes.error.status === 403) {
                if (meRes.error.data.error === "E-Mail address not verified") {
                    await navigateTo({
                        path: '/verify-email'
                    })
                    window.location.reload()
                    return
                }
            }
            return
        }
        session.value.user = meRes
    }

    async function startRefreshTimer() {
        setInterval(async () => {
            if (!session || session.value.session === null) {
                await refreshSession()
            } else if (session.value.session.expiresAt - 15000 < Date.now()) {
                await refreshSession()
            }
            if (session.value.session && !session.value.user) {
                await refreshUser()
            }
        }, 10000)
    }

    async function refreshSession() {
        try {
            const res = await $fetch(config.public.apiBaseUrl + '/auth/session/refresh', {
                method: "POST",
                credentials: "include"
            })

            session.value.session = res
            return res;

        } catch (e) {
            return {
                error: e
            };
        }
    }

    const refreshUser = async () => {
        try {
            const meRes = await $fetch(config.public.apiBaseUrl + '/auth/me', {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.value.session.accessToken}`,
                    Session: session.value.session.sessionId
                }
            })

            session.value.user = meRes
            return meRes;
        } catch (e) {
            return {
                error: e
            }
        }
    }

    return {
        provide : {
            startRefreshTimer,
            connect,
            refreshSession,
            refreshUser
        }
    }

})