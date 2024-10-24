import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { startKeyboards } from '../keyboards/startKeyboard'

export class LectureNotesCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.LECTURE_NOTES, async (ctx) => {
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
            const coursesHasLectureNotes = courses.filter((c) => c.lectureNotesInfo)
            return ctx.replyWithHTML(
                ctx.i18n.__('notes.group', {
                    notes: group.lectureNotesInfo,
                }) +
                    (coursesHasLectureNotes.length
                        ? '\n\n' +
                          ctx.i18n.__('notes.courses', {
                              notes: coursesHasLectureNotes
                                  .map((c) => `${c.name}:\n${c.lectureNotesInfo}`)
                                  .join('\n\n'),
                          })
                        : ''),
            )
        })
    }
}
