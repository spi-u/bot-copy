import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { Group, MosContract, MosStatus, Session, Student, TgUser } from '../models'
import { ScenesId } from '../scenes/types'
import { AdminEvents, adminKeyboards } from '../keyboards/adminKeyboard'
import xlsx from 'node-xlsx'
import moment from 'moment'
import { CfAccount } from '../models/CfAccount'
import { StudentToCourse } from '../models/StudentToCourse'
import { createSessionKey, getSessionKey } from '../utils'
import { Course } from '../models/Course'
import { Op } from 'sequelize'
import { initialBotState, initialUserState } from '../state'
import { NewsletterType } from '../scenes/admin/newsletterSerial'
import * as fs from 'fs'
import * as path from 'path'

const minCfAccountsForWarningCount = 5

export class AdminCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }

    handle() {
        this.bot.command('admin', async (ctx) => {
            const user = await TgUser.findByPk(ctx.session.state.user.id)
            if (!user) throw new Error('User is not defined')

            if (!user.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }

            const cfAccountsCount = await CfAccount.count({
                where: {
                    isActive: true,
                },
            })

            return ctx.reply(
                `${cfAccountsCount < minCfAccountsForWarningCount ? '⚠️ Заканчиваются свободные аккаунты CF, не забудьте добавить новые.\n\n' : ''}` +
                    'Выберите действия из списка:',
                adminKeyboards.mainActionsKeyboard,
            )
        })

        this.bot.action(AdminEvents.ON_OPEN_USER_MENU, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.editMessageReplyMarkup(adminKeyboards.userActionsKeyboard.reply_markup)
        })

        this.bot.action(AdminEvents.ON_OPEN_MAIN_MENU, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.editMessageReplyMarkup(adminKeyboards.mainActionsKeyboard.reply_markup)
        })

        this.bot.action(AdminEvents.ON_OPEN_FIND_USER_MENU, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.editMessageReplyMarkup(adminKeyboards.findUserKeyboard.reply_markup)
        })

        this.bot.action(AdminEvents.ON_OPEN_MOS_MENU, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.editMessageReplyMarkup(adminKeyboards.mosActionsKeyboard.reply_markup)
        })

        this.bot.action(AdminEvents.ON_OPEN_NEWSLETTER_MENU, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.editMessageReplyMarkup(adminKeyboards.newsletterActionsKeyboard.reply_markup)
        })

        this.bot.action(AdminEvents.ON_MOS_LOAD, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_MOS_SCENE)
        })

        this.bot.action(AdminEvents.ON_MOS_ADD_CONTRACT, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_MOS_ADD_CONTRACT_SCENE)
        })

        this.bot.action(AdminEvents.ON_MOS_GET_STATUS, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            const mosStudents = await Student.findAll({
                where: {
                    mosId: {
                        [Op.not]: null,
                    },
                },
            })

            const acceptedContractsCount = await MosContract.count({
                where: {
                    [Op.or]: [{ status: MosStatus.ACCEPTED }, { status: MosStatus.SIGNED }],
                    groupCode: {
                        [Op.ne]: 0,
                    },
                },
            })

            const waitingContractsCount = await MosContract.count({
                where: {
                    [Op.or]: [
                        { status: MosStatus.WAITING_ARRIVAL },
                        { status: MosStatus.WAITING_SIGNING },
                    ],
                },
            })

            const acceptedStudents = mosStudents.filter((student) => student.isMosAccepted)
            const notAcceptedStudents = mosStudents.filter((student) => !student.isMosAccepted)
            return ctx.replyWithHTML(
                `<b>Всего договоров ожидается для подписания: </b> ${waitingContractsCount}\n` +
                    `<b>Всего договоров принято:</b> ${acceptedContractsCount}\n\n` +
                    `<b>Всего студентов принято:</b> ${acceptedStudents.length}/${mosStudents.length}\n` +
                    `<b>Всего студентов не принято:</b> ${notAcceptedStudents.length}/${mosStudents.length}\n\n` +
                    `<b>Непринятые студенты:</b>\n` +
                    notAcceptedStudents
                        .slice(0, 15)
                        .map(
                            (student) =>
                                `<code>${student.firstName} ${student.lastName} (${student.id})</code>`,
                        )
                        .join('\n') +
                    (notAcceptedStudents.length - 15 > 0
                        ? `\n<i>и еще ${notAcceptedStudents.length - 15}...</i>`
                        : ''),
            )
        })

        this.bot.action(AdminEvents.ON_CF_ACCOUNTS_LOAD, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_CF_ACCOUNTS_SCENE)
        })

        this.bot.action(AdminEvents.ON_GET_USERS, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            const students = await Student.findAll({
                include: [
                    {
                        model: Group,
                        as: 'group',
                    },
                    {
                        model: TgUser,
                        as: 'user',
                    },
                ],
            })

            const data: any[][] = [
                [
                    'ID',
                    'Telegram Username',
                    'Зарегистрирован',
                    'Имя',
                    'Фамилия',
                    'Номер класса',
                    'Телефон',
                    'Почта',
                    'Страна',
                    'Город',
                    'Город школы',
                    'Школа',
                    'Логин NLogN',
                    'ID NLogN',
                    'Группа',
                    'Участвует в курсах',
                    'Номер MOS.RU',
                    'Ожидает подтверждения договора',
                    'ID Сцены',
                ],
            ]

            const sessions = await Session.findAll()
            for (const student of students) {
                const studentCourses = await student.getCourses()

                const currentSession = sessions.find(
                    (session) =>
                        session.key === createSessionKey(student.user.tg_id, student.user.tg_id),
                )
                const currentScene = currentSession
                    ? (JSON.parse(currentSession.data)['__scenes']?.current as string) ||
                      'Нет текущей сцены'
                    : 'Ошибка'
                data.push([
                    student.id,
                    student.user?.tg_username ? `@${student.user?.tg_username}` : 'нет',
                    student.isAuthenticated,
                    student.firstName,
                    student.lastName,
                    student.grade,
                    student.phone,
                    student.email,
                    student.country,
                    student.city,
                    student.schoolCity,
                    student.school,
                    student.nlognUsername,
                    student.nlognId,
                    student.group?.name,
                    studentCourses.length ? studentCourses.map((c) => c.name).join(', ') : 'нет',
                    student.mosId ? student.mosId : 'нет',
                    !student.isMosAccepted && student.mosId,
                    currentScene,
                ])
            }

            const sheetOptions = { '!cols': data[0].map((_) => ({ wch: 20 })) }
            const buffer = xlsx.build([{ name: 'users_list', data, options: sheetOptions }])
            return ctx.replyWithDocument({
                source: buffer,
                filename: `Выгрузка студентов ${moment().format('DD-MM-YYYY')}.xlsx`,
            })
        })

        this.bot.action(AdminEvents.ON_FIND_USER_BY_NAME, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_FIND_USER_BY_NAME_SCENE)
        })

        this.bot.action(AdminEvents.ON_FIND_USER_BY_USERNAME, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_FIND_USER_BY_USERNAME_SCENE)
        })

        this.bot.action(AdminEvents.ON_FIND_USER_BY_EMAIL, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_FIND_USER_BY_EMAIL_SCENE)
        })

        this.bot.action(AdminEvents.ON_SET_USER_GROUP, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_SET_USER_GROUP_SCENE)
        })

        this.bot.action(AdminEvents.ON_SET_USERS_GROUPS, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_SET_USERS_GROUPS_SCENE)
        })

        this.bot.action(AdminEvents.ON_GET_USERS_STATUS, async (ctx) => {
            const allStudentsCount = await Student.count()
            const allAuthStudentsCount = await Student.count({
                where: {
                    isAuthenticated: true,
                },
            })

            const groups = await Group.findAll({
                where: {
                    isVisible: true,
                },
            })
            const studentsByGroupsInfo = []
            for (const group of groups) {
                const studentsByGroupCount = await Student.count({
                    where: {
                        groupId: group.id,
                        isAuthenticated: true,
                    },
                })
                studentsByGroupsInfo.push(`<code>${group.name}</code>: ${studentsByGroupCount}`)
            }

            const courses = await Course.findAll({
                where: {
                    isVisible: true,
                },
            })
            const studentsByCoursesInfo = []
            for (const course of courses) {
                const studentsByCourseCount = await StudentToCourse.count({
                    where: {
                        CourseId: course.id,
                    },
                })
                studentsByCoursesInfo.push(`<code>${course.name}</code>: ${studentsByCourseCount}`)
            }

            return ctx.replyWithHTML(
                `<b>Всего учеников: ${allStudentsCount}</b>\n` +
                    `<b>Всего учеников закончили регистрацию: ${allAuthStudentsCount}</b>\n\n` +
                    `<b>Всего учеников закончили регистрацию по группам:</b>\n${studentsByGroupsInfo.join('\n')}\n\n` +
                    `<b>Всего учеников закончили регистрацию по направлениям:</b>\n${studentsByCoursesInfo.join('\n')}`,
            )
        })

        this.bot.action(AdminEvents.ON_GET_TABLES, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_GET_TABLE_SCENE)
        })

        this.bot.action(AdminEvents.ON_USER_ADMIN, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_USER_ADMIN)
        })

        this.bot.action(AdminEvents.ON_USER_RESTART, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_RESTART_USER)
        })

        this.bot.action(AdminEvents.ON_BAN_USER, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_BAN_USER)
        })
        this.bot.action(AdminEvents.ON_UNBAN_USER, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_UNBAN_USER)
        })

        this.bot.action(AdminEvents.ON_TESTING, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            await ctx.student.update({
                isAuthenticated: false,
            })
            await StudentToCourse.destroy({
                where: {
                    StudentId: ctx.student.id,
                },
            })

            ctx.session.__scenes = undefined
            ctx.session.state.user = initialUserState

            return ctx.reply('Теперь вы можете снова начать регистрацию. Наберите /start')
        })

        this.bot.action(AdminEvents.ON_SEND_AUTH, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_NEWSLETTER, {
                type: NewsletterType.TO_AUTH,
            })
        })

        this.bot.action(AdminEvents.ON_SEND_NOT_AUTH, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_NEWSLETTER, {
                type: NewsletterType.TO_NOT_AUTH,
            })
        })

        this.bot.action(AdminEvents.ON_SEND_GROUPS, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_NEWSLETTER, {
                type: NewsletterType.TO_GROUPS,
            })
        })

        this.bot.action(AdminEvents.ON_SEND_IDS, async (ctx) => {
            if (!ctx.tgUser.is_admin) {
                return ctx.replyWithHTML(ctx.i18n.__('admin_no_access'))
            }
            return ctx.scene.enter(ScenesId.ADMIN_NEWSLETTER, {
                type: NewsletterType.TO_IDS,
            })
        })

        this.bot.action(AdminEvents.ON_DOWNLOAD_MOS, async (ctx) => {
            if (!fs.existsSync(path.join(process.cwd(), 'files/contracts'))) {
                return ctx.replyWithHTML('Загруженных реестров не найдено')
            }
            const filenames = fs
                .readdirSync(path.join(process.cwd(), 'files/contracts'))
                .reverse()
                .slice(0, 5)
            for (const filename of filenames) {
                const contractDate = new Date(Number(filename.split('.')[0]))
                await ctx.replyWithDocument({
                    source: path.join(process.cwd(), 'files/contracts', filename),
                    filename: `Реестр заявлений  ${moment(contractDate).format('DD-MM-YYYY')}.xlsx`,
                })
            }
        })
    }
}
