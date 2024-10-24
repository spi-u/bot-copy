import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { Group } from '../models'
import { startKeyboards } from '../keyboards/startKeyboard'

export class ChatsCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.GROUP_CHATS, async (ctx) => {
            if (!ctx.student.isAuthenticated) {
                return ctx.replyWithHTML(
                    ctx.i18n.__('not_auth'),
                    startKeyboards.startRegistrationKeyboard,
                )
            }

            const group = await Group.findByPk(ctx.student.groupId)
            if (!group) {
                throw new Error('Group is not found')
            }

            const courses = await ctx.student.getCourses()
            const coursesHasChats = courses.filter((c) => !!c.chatsInfo)

            return ctx.replyWithHTML(
                ctx.i18n.__('chats.group', {
                    chats: group.chatsInfo,
                }) +
                    (coursesHasChats.length
                        ? '\n\n' +
                          ctx.i18n.__('chats.courses', {
                              chats: coursesHasChats
                                  .map((c) => `${c.name}:\n${c.chatsInfo}`)
                                  .join('\n\n'),
                          })
                        : ''),
            )
        })
    }
}
