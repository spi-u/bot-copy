import { SerialSceneGenerator } from './types'
import { ScenesId } from './types'
import { contestsService } from '../start'
import { ContestsEvents, contestsKeyboards } from '../keyboards/contestsKeyboard'
import { logger } from '../services'
import { getLog } from '../utils'

enum ContestsSerialSteps {
    ASK_ACCOUNT,
    LOGIN_INPUT,
    CODE_INPUT,
    CREATE_ACCOUNT,
    EMAIL_INPUT,
}

const askAccountSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        if (ctx.student.isAuthenticated && ctx.student.nlognId) {
            return ctx.scene.enter(ScenesId.END_SCENE)
        }
        return ctx.replyWithHTML(
            ctx.i18n.__('contests_scene.ask_account'),
            contestsKeyboards.confirmKeyboard,
        )
    })

    scene.action(ContestsEvents.ON_ACCOUNT_EXIST, async (ctx) => {
        logger.info(getLog(ctx, `click account exist`))
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.serial.next(ContestsSerialSteps.LOGIN_INPUT)
    })

    scene.action(ContestsEvents.ON_ACCOUNT_NOT_EXIST, async (ctx) => {
        logger.info(getLog(ctx, `click account not exist`))
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.serial.next(ContestsSerialSteps.CREATE_ACCOUNT)
    })
}

const loginInputSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('contests_scene.input_login'))
    })
    scene.on('text', async (ctx) => {
        const user = await contestsService.findUser(ctx.message.text)
        if (!user) {
            await ctx.replyWithHTML(ctx.i18n.__('contests_scene.account_not_found'))
            return ctx.serial.next(ContestsSerialSteps.ASK_ACCOUNT)
        }

        ctx.session.state.user.nlognId = user.id
        ctx.session.state.user.nlognUsername = user.username
        return ctx.serial.next(ContestsSerialSteps.CODE_INPUT)
    })
}

const codeInputSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('contests_scene.code_input'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        const confirmationCode = await contestsService.getTelegramCode(
            ctx.session.state.user.nlognId,
        )
        if (input !== confirmationCode) {
            logger.info(getLog(ctx, `code is incorrect`))
            await ctx.replyWithHTML(ctx.i18n.__('contests_scene.incorrect_code'))
            return ctx.serial.next(ContestsSerialSteps.ASK_ACCOUNT)
        }

        const group = ctx.student.group
        if (!group) {
            throw new Error(`Group for student with id=${ctx.student.id} is not found`)
        }

        const groupNlognId = group.nlognId
        const result = await contestsService.addUserToGroup(
            groupNlognId,
            ctx.session.state.user.nlognId,
        )

        if (result === null) {
            logger.error(getLog(ctx, `student account is already in nlogn group`))
            await ctx.replyWithHTML(ctx.i18n.__('contests_scene.account_already_in_group'))
            return ctx.serial.next(ContestsSerialSteps.ASK_ACCOUNT)
        }

        await ctx.student.update({
            nlognId: ctx.session.state.user.nlognId,
            nlognUsername: ctx.session.state.user.nlognUsername,
            groupId: group.id,
        })

        return ctx.scene.enter(ScenesId.END_SCENE)
    })
}

const createAccountSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        const group = ctx.student.group

        if (!group) {
            throw new Error(`Group for student with id=${ctx.student.id} is not found`)
        }

        const result = await contestsService.createNewUser({
            firstName: ctx.student.firstName,
            lastName: ctx.student.lastName,
            groupIds: [group.nlognId],
        })

        // if (result === null) {
        //     return ctx.replyWithHTML(
        //         ctx.i18n.__('contests_scene.email_is_exist', {
        //             email: ctx.student.email
        //         }),
        //         contestsKeyboards.emailExistKeyboard
        //     )
        // }

        await ctx.student.update({
            nlognId: result.id,
            nlognUsername: result.username,
            groupId: group.id,
        })

        logger.info(getLog(ctx, `account created (${result.username}/${result.password})`))
        await ctx.replyWithHTML(
            ctx.i18n.__('contests_scene.account_created', {
                username: result.username,
                password: result.password,
            }),
        )

        return ctx.scene.enter(ScenesId.END_SCENE)
    })

    scene.action(ContestsEvents.ON_EDIT_EMAIL, async (ctx) => {
        logger.info(getLog(ctx, `click edit email`))
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.serial.next(ContestsSerialSteps.EMAIL_INPUT)
    })

    scene.action(ContestsEvents.ON_ACCOUNT_EXIST, async (ctx) => {
        logger.info(getLog(ctx, `click account exist`))
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.serial.next(ContestsSerialSteps.LOGIN_INPUT)
    })
}

const emailInputSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('contests_scene.email_input'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text
        await ctx.student.update({
            email: input,
        })

        await ctx.replyWithHTML(ctx.i18n.__('contests_scene.email_update'))
        return ctx.serial.next(ContestsSerialSteps.ASK_ACCOUNT)
    })
}

export const contestsSerial = [
    askAccountSceneGen,
    loginInputSceneGen,
    codeInputSceneGen,
    createAccountSceneGen,
    emailInputSceneGen,
]
