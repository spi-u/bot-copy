import { BotContextMessageUpdate } from '../types'
import { SceneView } from './types'
import { BaseScene } from 'telegraf/typings/scenes'
import Scene from './scene'
import { createMainKeyboard } from '../keyboards/mainKeyboard'
import { canSelectAnotherCourse, isWithRatings } from '../utils'
import { Course } from '../models/Course'
import { logger } from '../services'
import { getLog } from '../utils'

export class EndScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
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
            const coursesList = studentCourses.map((c) => `<code>${c.name}</code>`).join(', ')

            if (ctx.student.isAuthenticated) {
                logger.info(getLog(ctx, `new course selected`))

                await ctx.replyWithHTML(
                    ctx.i18n.__('select_courses.success', {
                        courses: coursesList,
                    }),
                    mainKeyboard,
                )
                return ctx.scene.leave()
            }

            await ctx.student.update({
                isAuthenticated: true,
            })

            logger.info(getLog(ctx, `finished authentication`))

            const currentCourse = studentCourses[0]
            await ctx.replyWithHTML(
                currentCourse.isDefault ? group.info : currentCourse.info,
                mainKeyboard,
            )

            return ctx.scene.leave()
        })

        return this.scene
    }
}
