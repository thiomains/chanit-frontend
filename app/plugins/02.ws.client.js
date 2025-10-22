export default defineNuxtPlugin(() => {
    const session = useState("session")
    const config = useRuntimeConfig()

    let ws

    async function connectWebsocket() {

        if (ws && ws.readyState === WebSocket.OPEN) {
            return ws
        }

        return new Promise((resolve, reject) => {
            if (!session.value.session) reject()

            try {
                ws = new WebSocket(config.public.webSocketUrl + "?session=" + session.value.session.sessionId + "&token=" + session.value.session.accessToken)
            } catch (e) {
                reject()
            }

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data)
                if (!message) return
                if (message.type === "authentication-failure") {
                    reject()
                } else if (message.type === "authentication-success") {
                    ws.send(JSON.stringify({
                        type: "client-connection"
                    }))
                    resolve(ws)
                }
            }

            ws.onerror = () => {
                reject()
            }

            ws.onclose = () => {
                window.location.reload()
            }
        })
    }

    return {
        provide: {
            connectWebsocket
        }
    }
})