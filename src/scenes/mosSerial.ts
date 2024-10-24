import fs from 'fs'
import path from 'path'
import moment from 'moment'
import { getSerialStepSceneId } from './scene'
import { SerialSceneGenerator } from './types'
import { ScenesId } from './types'
import { includes } from 'lodash'
import { MosEvents, mosKeyboards } from '../keyboards/mosKeyboard'
import { canSelectAnotherCourse, isWithRatings } from '../utils'
import { Course } from '../models/Course'
import { MosContract, MosStatus } from '../models'
import { bot } from '../start'
import { logger } from '../services'
import { getLog } from '../utils'

export const mosNames = ['москва', 'moscow', 'мск']

enum MosSerialSteps {
    CONFIRMATION,
    CONTRACT,
    WAITING,
}

interface MosContractSceneState {
    isRetryCodeInput: boolean
}

interface MosWaitingSceneState {
    isAccepted: boolean
}

const mosConfirmationSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        if (ctx.session.state.user.isFromMoscow) {
            return ctx.scene.enter(getSerialStepSceneId(ScenesId.MOS_SCENE, 1))
        }

        if (ctx.student.schoolCity && includes(mosNames, ctx.student.schoolCity.toLowerCase())) {
            logger.info(getLog(ctx, `moscow confirmed`))
            return ctx.serial.next()
        }

        const courses = await ctx.student.getCourses()
        if (isWithRatings(courses)) {
            return ctx.scene.enter(ScenesId.CONTEST_SCENE)
        }

        return ctx.scene.enter(ScenesId.END_SCENE)
    })

    scene.action(MosEvents.CONTINUE, async (ctx) => {
        logger.info(getLog(ctx, `click continue`))
        await ctx.deleteMessageOrClearReplyMarkup()

        const courses = await ctx.student.getCourses()
        if (isWithRatings(courses)) {
            return ctx.scene.enter(ScenesId.CONTEST_SCENE)
        }

        return ctx.scene.enter(ScenesId.END_SCENE)
    })

    scene.action(MosEvents.SELECT_COURSE, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.enter(ScenesId.COURSE_SCENE)
    })
}

const mosContractSceneGen: SerialSceneGenerator<MosContractSceneState> = (scene) => {
    scene.enter(async (ctx) => {
        if (ctx.scene.session.state && ctx.scene.session.state.isRetryCodeInput) {
            logger.info(getLog(ctx, `retry input code`))
            await ctx.deleteMessageOrClearReplyMarkup()
            return ctx.replyWithHTML(ctx.i18n.__('mos_scene.retry_input'))
        }

        const group = await ctx.student.getGroup()
        if (!group) {
            throw new Error('Group is not found')
        }

        const selectedCourse = await Course.findByPk(ctx.session.state.user.lastSelectedCourseId)
        if (!selectedCourse) throw new Error('Course is not found')

        await ctx.replyWithHTML(ctx.i18n.__('mos_scene.info'))

        await ctx.replyWithPhoto({
            source: fs.readFileSync(path.join(process.cwd(), 'files/mos_example.png')),
            filename: 'mos_example.png',
        })

        return ctx.replyWithHTML(
            ctx.i18n.__('mos_scene.info_input', {
                course: selectedCourse.name,
            }),
        )
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        if (input.length > 20) {
            return ctx.replyWithHTML(ctx.i18n.__('mos_scene.not_valid'))
        }

        if (!/^ESZ\d*$/.test(input) && !/^\d*$/.test(input)) {
            return ctx.replyWithHTML(ctx.i18n.__('mos_scene.not_valid'))
        }

        await ctx.student.update({
            mosId: input,
            isMosAccepted: false,
        })

        ctx.session.state.user.mosIds = [...(ctx.session.state.user.mosIds || []), input]

        return ctx.serial.next<MosWaitingSceneState>(MosSerialSteps.WAITING, {
            isAccepted: true,
        })
    })
}

const waitingConfirmationSceneGen: SerialSceneGenerator<MosWaitingSceneState> = (scene) => {
    scene.enter(async (ctx) => {
        if (ctx.scene.session.state.isAccepted) {
            const courses = await Course.findAll({
                where: {
                    isVisible: true,
                },
            })
            const studentCourses = await ctx.student.getCourses()
            const group = await ctx.student.getGroup()
            const canSelect = canSelectAnotherCourse(courses, studentCourses, group.isSimple)

            logger.info(getLog(ctx, `verified mos.ru`))
            return ctx.replyWithHTML(
                canSelect
                    ? bot.__('mos_scene.success')
                    : bot.__('mos_scene.success_all_courses_selected'),
                mosKeyboards.continueKeyboard(canSelect),
            )
        }
        return ctx.replyWithHTML(ctx.i18n.__('mos_scene.wait_info'), mosKeyboards.waitingKeyboard)
    })

    scene.action(MosEvents.CONTINUE, async (ctx) => {
        logger.info(getLog(ctx, `click continue`))

        await ctx.deleteMessageOrClearReplyMarkup()
        const courses = await ctx.student.getCourses()
        if (isWithRatings(courses)) {
            return ctx.scene.enter(ScenesId.CONTEST_SCENE)
        }
        return ctx.scene.enter(ScenesId.END_SCENE)
    })

    scene.action(MosEvents.SELECT_COURSE, async (ctx) => {
        logger.info(getLog(ctx, `click select course`))
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.enter(ScenesId.COURSE_SCENE)
    })

    scene.action(MosEvents.ON_RETRY, async (ctx) => {
        logger.info(getLog(ctx, `click retry input code`))
        if (!ctx.student.isMosAccepted) {
            return ctx.serial.next<MosContractSceneState>(MosSerialSteps.CONTRACT, {
                isRetryCodeInput: true,
            })
        }
    })

    scene.action(MosEvents.ON_GET_STATUS, async (ctx) => {
        logger.info(getLog(ctx, `click get status`))
        if (!ctx.student.isMosAccepted) {
            await ctx.deleteMessageOrClearReplyMarkup()
            const contract = await MosContract.findOne({
                where: {
                    mosId: ctx.student.mosId as string,
                    isActive: true,
                },
            })

            if (contract) {
                let status: string
                switch (contract.status) {
                    case MosStatus.ACCEPTED:
                        status = 'accepted'
                        break
                    case MosStatus.SIGNED:
                        status = 'accepted'
                        break
                    case MosStatus.WAITING_SIGNING:
                        status = 'waiting_signing'
                        break
                    case MosStatus.WAITING_ARRIVAL:
                        status = 'waiting_arrival'
                        break
                    case MosStatus.REJECTED:
                        status = 'rejected'
                        break
                    case MosStatus.REVOKED:
                        status = 'revoked'
                        break
                    case MosStatus.CANCELED:
                        status = 'canceled'
                        break
                    default:
                        status = 'any'
                }
                await ctx.replyWithHTML(
                    ctx.i18n.__(`mos_scene.status.${status}`) +
                        '\n' +
                        ctx.i18n.__('mos_scene.date', {
                            date: moment(contract?.updatedAt).format('DD.MM.YYYY'),
                        }),
                )
            } else {
                await ctx.replyWithHTML(ctx.i18n.__('mos_scene.status.not_found'))
            }

            return ctx.replyWithHTML(
                ctx.i18n.__('mos_scene.wait_info'),
                mosKeyboards.waitingKeyboard,
            )
        }
    })
}

export const mosSerial = [mosConfirmationSceneGen, mosContractSceneGen, waitingConfirmationSceneGen]
