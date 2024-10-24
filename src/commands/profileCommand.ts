import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { Group } from '../models'
import { startKeyboards } from '../keyboards/startKeyboard'

export class ProfileCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.PROFILE, async (ctx) => {
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

            return ctx.replyWithHTML(
                ctx.i18n.__('profile', {
                    firstName: ctx.student.firstName,
                    lastName: ctx.student.lastName,
                    city: ctx.student.city,
                    country: ctx.student.country,
                    school: ctx.student.school,
                    email: ctx.student.email,
                    phone: ctx.student.phone,
                    nlognUsername: ctx.student.nlognUsername,
                    groupName: group.name,
                    courses: courses.map((c) => c.name).join(', '),
                }),
            )
        })
    }
}
