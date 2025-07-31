export default defineNuxtPlugin(async (nuxtApp) => {
    let userStatus = ref(new Map())

    const ws = await nuxtApp.$connectWebsocket()
    ws.addEventListener("message", () => {
        const message = JSON.parse(event.data)
        if (message.type !== "online-status") return
        console.log(message)
        setOnlineStatus(message.userId, message.status)
    })


    function setOnlineStatus(userId, onlineStatus) {
        userStatus.value.set(userId, onlineStatus)
    }

    function getOnlineStatus(userId) {
        const status = userStatus.value.get(userId)
        if (!status) return "offline"
        return status
    }

    return {
        provide: {
            setOnlineStatus,
            getOnlineStatus
        }
    }
})