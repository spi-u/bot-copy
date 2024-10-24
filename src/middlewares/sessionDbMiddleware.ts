import { BotContext } from '../types'
import { middlewareFn } from './types'
import { createSession, getSessionDataByKey, setSessionByKey } from '../models'
import { getSessionKey } from '../utils'

export function sessionDbMiddleware(): middlewareFn<BotContext> {
    return async function (ctx, next) {
        const key = await getSessionKey(ctx)
        if (!key) return next()

        let session = (await getSessionDataByKey(key)) || {}

        Object.defineProperty(ctx, 'session', {
            get: function () {
                return session
            },
            set: function (newValue) {
                session = Object.assign({}, newValue)
            },
        })

        await next()

        if (await getSessionDataByKey(key)) {
            return await setSessionByKey(key, JSON.stringify(session))
        } else {
            return await createSession(key, JSON.stringify(session))
        }
    }
}
