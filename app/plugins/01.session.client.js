export default defineNuxtPlugin(async () => {

    const nuxtApp = useNuxtApp()

    const session = useState('session', () => ({
        session: null,
        user: null,
    }))
    const config = useRuntimeConfig()

    const refreshToken = async () => {

        try {
            const res = await $fetch(config.public.apiBaseUrl + '/auth/session/refresh', {
                method: "POST",
                credentials: "include"
            })

            session.value = {
                session: res,
            }

            return true;

        } catch (e) {
            await navigateTo({path: '/login'});
            return false;
        }
    }

    const checkToken = async () => {

        let sessionValid

        if (session || session.value.session === null) {
            sessionValid = !!(await refreshToken());
        }
        else if (session.value.session.expiresAt - 60000 < Date.now()) {
            sessionValid = !!(await refreshToken());
        }

        if (sessionValid && !session.value.user) {
            await refreshUser()
        }

        return sessionValid;
    }

    const refreshUser = async () => {
        const meRes = await $fetch(config.public.apiBaseUrl + '/auth/me', {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.value.session.accessToken}`,
                Session: session.value.session.sessionId
            }
        })

        session.value.user = meRes;
    }

    await checkToken()

    return {
        provide : {
            checkToken,
        }
    }

})