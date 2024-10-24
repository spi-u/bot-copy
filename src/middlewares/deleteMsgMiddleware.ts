import { BotContext } from '../types'

export const deleteMsgMiddleware = () => async (ctx: BotContext, next: () => void) => {
    ctx.deleteMessageOrClearReplyMarkup = async () => {
        try {
            await ctx.deleteMessage()
        } catch (e) {
            console.log(e)
            await ctx.editMessageReplyMarkup(undefined)
        }
    }
    return next()
}
