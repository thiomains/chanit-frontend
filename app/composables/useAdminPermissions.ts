export function useAdminPermissions() {
    const perms = useState<Record<string, any> | null>('adminPermissions', () => null)
    const loading = ref(false)

    async function refresh() {
        loading.value = true
        try {
            const api = useAdminApi()
            perms.value = await api.get('/admin/me')
        } catch (e) {
            perms.value = null
        } finally {
            loading.value = false
        }
    }

    function has(perm: string): boolean {
        if (!perms.value) return false
        return perms.value[perm] === true
    }

    return { perms, loading, has, refresh }
}
