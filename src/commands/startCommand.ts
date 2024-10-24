import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { ScenesId } from '../scenes/types'
import { createMainKeyboard } from '../keyboards/mainKeyboard'
import { StartEvents, startKeyboards } from '../keyboards/startKeyboard'
import { canSelectAnotherCourse, isWithRatings } from '../utils'
import { Course } from '../models/Course'

export class StartCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.start(async (ctx) => {
            if (ctx.student.isAuthenticated) {
                const courses = await Course.findAll({
                    where: {
                        isVisible: true,
                    },
                })
                const studentCourses = await ctx.student.getCourses()
                const group = await ctx.student.getGroup()

                const mainKeyboard = createMainKeyboard(
                    isWithRatings(studentCourses),
                    canSelectAnotherCourse(courses, studentCourses, group.isSimple),
                )
                return ctx.replyWithHTML(ctx.i18n.__('start_command.user_exist'), mainKeyboard)
            }

            return ctx.replyWithHTML(
                ctx.i18n.__('start_command.hello'),
                startKeyboards.startRegistrationKeyboard,
            )
        })

        this.bot.action(StartEvents.ON_START_REGISTRATION, async (ctx) => {
            await ctx.editMessageReplyMarkup(undefined)
            return ctx.scene.enter(ScenesId.USER_INFO_SCENE)
        })
    }
}
