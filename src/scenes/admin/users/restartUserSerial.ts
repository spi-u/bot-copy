import { SerialSceneGenerator } from "../../types"
import {Group, Session, Student, TgUser} from "../../../models"
import {AdminEvents, adminKeyboards} from "../../../keyboards/adminKeyboard"
import {createStudentInfo} from "../utils"
import {createSessionKey, getSessionKey} from "../../../utils/getSessionKey";
import {startKeyboards} from "../../../keyboards/startKeyboard";
import {StudentToCourse} from "../../../models/StudentToCourse";

interface RestartUserState {
    userId: number,
    studentId: number
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
        return ctx.serial.next<RestartUserState>(
            ctx.serial.getCurrentIndex() + 1,
            {
                userId: student.user.id,
                studentId: student.id
            }
        )
    })
}

const restartUserSceneGen: SerialSceneGenerator<RestartUserState> = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML('Вы уверены, что хотите перезагрузить пользователя?', adminKeyboards.restartUserConfirmKeyboard)
    })


    scene.action(AdminEvents.ON_CONFIRM_RESTART_USER, async (ctx) => {
        const user = await TgUser.findByPk(ctx.scene.session.state.userId)

        if (!user)
            throw new Error('User is not found')

        const session = await Session.findOne({
            where: {
                key: createSessionKey(user.tg_id, user.tg_id)
            }
        })

        if (!session)
            throw new Error('Session is not found')

        await ctx.telegram.sendMessage(user.tg_id, ctx.i18n.__('account_deleted'), startKeyboards.startRegistrationKeyboard)
        // todo: cascade

        await StudentToCourse.destroy({
            where: {
                StudentId: ctx.scene.session.state.studentId
            }
        })

        await Student.destroy({
            where: {
                userId: user.id
            }
        })

        await session.destroy()
        await user.destroy()

        return ctx.replyWithHTML('Успешно!')
    })

    scene.action(AdminEvents.ON_NOT_CONFIRM_RESTART_USER, async (ctx) => {
        return ctx.scene.leave()
    })
}

export const restartUserSerial = [
    findStudentSceneGen,
    restartUserSceneGen
]