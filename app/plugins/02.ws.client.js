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

                callEvent(message)

                if (message.type === "authentication-failure") {
                    reject()
                } else if (message.type === "authentication-success") {
                    ws.send(JSON.stringify({
                        type: "client-connection"
                    }))
                    resolve(ws)
                } else if (message.type === "ping") {
                    ws.send(JSON.stringify({
                        type: "pong"
                    }))
                }
            }

            ws.onerror = () => {
                reject()
            }

            ws.onclose = () => {
                connectWebsocket()
            }
        })
    }

    let listenerCounter = 0
    let listeners = new Map()

    function addWsListener(messageType, callback) {
        listeners.set(listenerCounter, {
            messageType: messageType,
            callback: callback
        })
        listenerCounter++
    }

    function removeWsListener(id) {
        listeners.delete(id)
    }

    async function callEvent(message) {
        for (const listener of listeners.values()) {
            if (listener.messageType !== message.type) continue
            console.log(listener)
            listener.callback(message)
        }
    }

    return {
        provide: {
            connectWebsocket, addWsListener, removeWsListener
        }
    }
})