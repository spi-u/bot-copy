import { middlewareFn } from './types'
import { BotContext } from '../types'
import { logger } from '../services'
import { getLog } from '../utils'

export function logsMiddleware(): middlewareFn<BotContext> {
    return async function (ctx: BotContext, next) {
        const message = ctx.message && 'text' in ctx.message ? 'type: ' + ctx.message.text : ''
        logger.info(getLog(ctx, message))
        return await next()
    }
}
