import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { startKeyboards } from '../keyboards/startKeyboard'

export class TeachersCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.TEACHERS, async (ctx) => {
            if (!ctx.student.isAuthenticated) {
                return ctx.replyWithHTML(
                    ctx.i18n.__('not_auth'),
                    startKeyboards.startRegistrationKeyboard,
                )
            }

            const group = await ctx.student.getGroup()
            if (!group) {
                throw new Error('Group is not found')
            }

            const courses = await ctx.student.getCourses()
            const coursesHasTeachers = courses.filter((c) => c.teachersInfo)
            return ctx.replyWithHTML(
                ctx.i18n.__('teachers.group', {
                    teachers: group.teachersInfo,
                }) +
                    (coursesHasTeachers.length
                        ? '\n\n' +
                          ctx.i18n.__('teachers.courses', {
                              teachers: coursesHasTeachers
                                  .map((c) => `${c.name}:\n${c.teachersInfo}`)
                                  .join('\n\n'),
                          })
                        : ''),
            )
        })
    }
}
