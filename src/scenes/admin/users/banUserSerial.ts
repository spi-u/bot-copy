import { SerialSceneGenerator } from "../../types"
import {Group, Session, Student, TgUser} from "../../../models"
import {AdminEvents, adminKeyboards} from "../../../keyboards/adminKeyboard"
import {createStudentInfo} from "../utils"

interface BanUserState {
    userId: number,
}

const findStudentSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.reply('Введите ID студента: ')
    })

    scene.on('text', async (ctx) => {
        const studentId = ctx.message.text

        const student = await Student.findByPk(parseInt(studentId), {
            include: [
                {
                    model: Group,
                    as: 'group',
                },
                {
                    model: TgUser,
                    as: 'user'
                },
            ],
        })

        if (!student) {
            await ctx.reply('Студент не найден')
            return ctx.scene.leave()
        }

        await ctx.replyWithHTML('Студент найден: \n' + await createStudentInfo(student))
        return ctx.serial.next<BanUserState>(
            ctx.serial.getCurrentIndex() + 1,
            {
                userId: student.user.id
            }
        )
    })
}

const banUserSceneGen: SerialSceneGenerator<BanUserState> = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML('Вы уверены, что хотите заблокировать пользователя?', adminKeyboards.banUserConfirmKeyboard)
    })


    scene.action(AdminEvents.ON_CONFIRM_BAN_USER, async (ctx) => {
        const user = await TgUser.findByPk(ctx.scene.session.state.userId)

        if (!user)
            throw new Error('User is not found')

        await user.update({
            is_banned: true
        })

        await ctx.telegram.sendMessage(user.tg_id, ctx.i18n.__('account_banned'))
        return ctx.replyWithHTML('Успешно!')
    })

    scene.action(AdminEvents.ON_NOT_CONFIRM_BAN_USER, async (ctx) => {
        return ctx.scene.leave()
    })
}

export const banUserSerial = [
    findStudentSceneGen,
    banUserSceneGen
]