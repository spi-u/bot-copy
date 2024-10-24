import {BotContext} from "../types";

export function getLog(ctx: BotContext, message: string) {
    if (!ctx.from || !ctx.chat) {
        return
    }

    const username = ctx.from.username ? ctx.from.username : ''
    const firstName = ctx.from.first_name
    const lastName = ctx.from.last_name ? ctx.from.last_name : ''
    const sceneId = ctx.session.__scenes && ctx.session.__scenes.current
        ? ctx.session.__scenes.current + ' '
        : ''

    return `${ctx.update.update_id}/${ctx.chat.id} ${username} (${firstName} ${lastName}) - ${sceneId} ${message}`
}