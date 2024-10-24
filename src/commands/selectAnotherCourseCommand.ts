import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { startKeyboards } from '../keyboards/startKeyboard'
import { Course } from '../models/Course'
import { canSelectAnotherCourse } from '../utils'
import { ScenesId } from '../scenes/types'

export class SelectAnotherCourseCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.SELECT_ANOTHER_COURSES, async (ctx) => {
            if (!ctx.student.isAuthenticated) {
                return ctx.replyWithHTML(
                    ctx.i18n.__('not_auth'),
                    startKeyboards.startRegistrationKeyboard,
                )
            }

            const group = await ctx.student.getGroup()
            const studentCourses = await ctx.student.getCourses()
            const courses = await Course.findAll({
                where: {
                    isVisible: true,
                },
            })
            if (canSelectAnotherCourse(courses, studentCourses, group.isSimple)) {
                return ctx.scene.enter(ScenesId.COURSE_SCENE)
            }

            return ctx.replyWithHTML(ctx.i18n.__('select_courses.all_courses_selected'))
        })
    }
}
