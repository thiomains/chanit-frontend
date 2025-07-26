import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const instance = axios.create({
        baseURL: config.public.apiBaseUrl,
        withCredentials: true
    })

    // Bereitstellen als $axios
    nuxtApp.provide('axios', instance)
})