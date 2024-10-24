import { BotContextMessageUpdate } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'

export const commandsMiddleware = () => async (ctx: BotContextMessageUpdate, next: () => void) => {
    if (
        [
            '/start',
            '/admin',
            MainKeyboardButtons.PROFILE,
            MainKeyboardButtons.TEACHERS,
            MainKeyboardButtons.GROUP_CHATS,
            MainKeyboardButtons.LECTURE_NOTES,
            MainKeyboardButtons.SELECT_ANOTHER_COURSES,
            MainKeyboardButtons.RATING_TABLE,
        ].includes(ctx.message?.text)
    ) {
        if (!ctx.scene.current) {
            return ctx.replyWithHTML(ctx.i18n.__('command_not_exist'))
        }
        return ctx.replyWithHTML(ctx.i18n.__('command_not_allowed'))
    }
    return next()
}
