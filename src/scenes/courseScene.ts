import fs from 'fs'
import path from 'path'
import { BotContextMessageUpdate } from '../types'
import { ScenesId, SceneView } from './types'
import { BaseScene } from 'telegraf/typings/scenes'
import Scene from './scene'
import { Course } from '../models/Course'
import { CourseEvents, courseKeyboards } from '../keyboards/courseKeyboard'
import { isWithRatings } from '../utils'
import { logger } from '../services'
import { getLog } from '../utils'

export class CourseScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            const group = await ctx.student.getGroup()
            if (!group) {
                throw new Error(`Group for student with id=${ctx.student.id} is not found`)
            }

            let courses = await Course.findAll({
                where: {
                    isVisible: true,
                },
                order: ['indexInList'],
            })

            if (group.isSimple) {
                courses = courses.filter((course) => course.isDefault)
                if (!courses.length) {
                    throw new Error('Not found default courses for simple group')
                }
                //
                // await ctx.student.addCourse(defaultCourses[0])
                // ctx.session.state.user.lastSelectedCourseId = defaultCourses[0].id
                // return ctx.scene.enter(ScenesId.MOS_SCENE)
            }

            const studentCourses = await ctx.student.getCourses()
            const studentCoursesIds = studentCourses.map((course) => course.id)

            courses = courses.filter((course) => !studentCoursesIds.includes(course.id))
            await ctx.replyWithPhoto({
                source: fs.readFileSync(path.join(process.cwd(), 'files/groups_info.png')),
                filename: 'groups_info.png',
            })
            return ctx.replyWithHTML(
                ctx.i18n.__('course_scene.select') +
                    (studentCourses.length
                        ? '\n\n' +
                          ctx.i18n.__('course_scene.selected_courses', {
                              courses: studentCourses
                                  .map((c) => `<code>${c.name}</code>`)
                                  .join(', '),
                          })
                        : ''),
                courseKeyboards.createListKeyboard(courses, !!studentCourses.length),
            )
        })

        // TODO: fix me
        this.scene.action(/ON_COURSE_SELECT_(.*)/i, async (ctx) => {
            await ctx.deleteMessageOrClearReplyMarkup()

            const course = await Course.findByPk(ctx.match[1])
            if (!course) {
                throw new Error('Курс не найден.')
            }
            logger.info(getLog(ctx, `course ${course.name} selected`))

            await ctx.student.addCourse(course)
            ctx.session.state.user.lastSelectedCourseId = course.id

            await ctx.replyWithHTML(
                ctx.i18n.__('course_scene.selected_course', { name: course.name }),
            )

            return ctx.scene.enter(ScenesId.MOS_SCENE)
        })

        this.scene.action(CourseEvents.CONTINUE, async (ctx) => {
            logger.info(getLog(ctx, `click continue`))
            await ctx.deleteMessageOrClearReplyMarkup()
            const courses = await ctx.student.getCourses()

            if (isWithRatings(courses)) {
                return ctx.scene.enter(ScenesId.CONTEST_SCENE)
            }

            return ctx.scene.enter(ScenesId.END_SCENE)
        })

        return this.scene
    }
}
