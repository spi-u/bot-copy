import phone from 'phone'
import { ScenesId, SerialSceneGenerator } from './types'
import { UserInfoEvents, userInfoKeyboards } from '../keyboards/userInfoKeyboard'
import * as EmailValidator from 'email-validator'
import { isGrade, isName, getLog } from '../utils'
import { logger } from '../services'

const firstNameSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.first_name'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        if (!isName(input)) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.first_name_not_valid'))
        }
        ctx.session.state.user.userInfo.firstName = input
        return ctx.serial.next()
    })
}

const lastNameSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.last_name'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text
        if (!isName(input)) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.last_name_not_valid'))
        }
        ctx.session.state.user.userInfo.lastName = input
        return ctx.serial.next()
    })
}

const gradeSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.grade'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text
        if (!isGrade(input)) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.grade_not_valid'))
        }
        ctx.session.state.user.userInfo.grade = input
        return ctx.serial.next()
    })
}

const phoneSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.phone'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text
        const result = phone(input)
        if (!result.isValid) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.phone_not_valid'))
        }

        ctx.session.state.user.userInfo.phone = result.phoneNumber
        return ctx.serial.next()
    })
}

const emailSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.email'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        if (!EmailValidator.validate(input)) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.email_not_valid'))
        }

        ctx.session.state.user.userInfo.email = input
        return ctx.serial.next()
    })
}

const countrySceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.country'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        ctx.session.state.user.userInfo.country = input
        return ctx.serial.next()
    })
}

const citySceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.city'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        ctx.session.state.user.userInfo.city = input
        return ctx.serial.next()
    })
}

const schoolCitySceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.school_city'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        ctx.session.state.user.userInfo.schoolCity = input
        return ctx.serial.next()
    })
}

const schoolSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.school'))
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text

        ctx.session.state.user.userInfo.school = input
        return ctx.serial.next()
    })
}

const checkUsersDataSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        if (!ctx.tgUser.tg_username && !ctx.tgUser.phone) {
            logger.info(getLog(ctx, 'user does not have telegram username'))
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.tg_phone'))
        }

        const userInfo = ctx.session.state.user.userInfo
        return ctx.replyWithHTML(
            ctx.i18n.__('user_info_scene.confirm', { ...userInfo }),
            userInfoKeyboards.checkUserDataKeyboard,
        )
    })

    scene.action(UserInfoEvents.ON_USER_INFO_CORRECT, async (ctx) => {
        await ctx.student.update(ctx.session.state.user.userInfo)
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.enter(ScenesId.GROUP_SCENE)
    })

    scene.action(UserInfoEvents.ON_USER_INFO_NOT_CORRECT, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.serial.restart()
    })

    scene.on('text', async (ctx) => {
        const input = ctx.message.text
        const result = phone(input)
        if (!result.isValid) {
            return ctx.replyWithHTML(ctx.i18n.__('user_info_scene.phone_not_valid'))
        }

        await ctx.tgUser.update({
            phone: result.phoneNumber,
        })
        return ctx.scene.reenter()
    })
}

export const userInfoSerial = [
    firstNameSceneGen,
    lastNameSceneGen,
    gradeSceneGen,
    phoneSceneGen,
    emailSceneGen,
    countrySceneGen,
    citySceneGen,
    schoolCitySceneGen,
    schoolSceneGen,
    checkUsersDataSceneGen,
]
