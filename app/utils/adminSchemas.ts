import * as v from 'valibot'

export const reasonSchema = v.object({
    reason: v.pipe(v.string(), v.minLength(10, 'Reason must be at least 10 characters')),
})
