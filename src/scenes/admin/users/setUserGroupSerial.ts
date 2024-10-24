import { SerialSceneGenerator } from "../../types"
import {Group, Student, TgUser} from "../../../models"
import {AdminEvents, adminKeyboards} from "../../../keyboards/adminKeyboard"
import {MovingStatus, setUserGroup} from "./setUsersGroupsScene"
import {createStudentInfo} from "../utils"
import {Course} from "../../../models/Course";

interface SetUserGroupState {
    newGroup: Group,
    currentGroup: Group | undefined,
    studentId: number,
    isPendingDeletionFromGroup: boolean
}

const findStudentAndGroupSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.reply('Введите ID студента и ID группы в NLogN через пробел: ')
    })

    scene.on('text', async (ctx) => {
        const [studentId, nlognGroupId] = ctx.message.text.split(' ')

        const student = await Student.findByPk(parseInt(studentId), {
            include: [
                {
                    model: Group,
                    as: 'group',
                    attributes: ['id', 'name', 'nlognId']
                },
                {
                    model: TgUser,
                    as: 'user'
                }
            ],
        })

        if (!student) {
            await ctx.reply('Студент не найден')
            return ctx.scene.leave()
        }

        const newGroup = await Group.findOne({
            where: {
                nlognId: parseInt(nlognGroupId),
            },
            attributes: ['id', 'name', 'nlognId']
        })

        if (!newGroup) {
            await ctx.reply('Группа не соответствует с группой в базе')
            return ctx.scene.leave()
        }

        await ctx.replyWithHTML('Студент найден: \n' + await createStudentInfo(student))

        if (!student.nlognId) {
            await ctx.reply('Студент не имеет аккаунта NlogN.')
            return ctx.scene.leave()
        }

        if (student.group?.nlognId === parseInt(nlognGroupId)) {
            await ctx.reply(`Студент уже состоит в группе ${student.group.name}.`)
            return ctx.scene.leave()
        }

        return ctx.serial.next<SetUserGroupState>(
            ctx.serial.getCurrentIndex() + 1,
            {
                newGroup,
                currentGroup: student.group,
                studentId: student.id,
                isPendingDeletionFromGroup: student.isPendingDeletionFromGroup,
            }
        )
    })
}

const setUserGroupSceneGen: SerialSceneGenerator<SetUserGroupState> = (scene) => {
    scene.enter(async (ctx) => {
        const {
            currentGroup,
            newGroup,
            isPendingDeletionFromGroup
        } = ctx.scene.session.state
        return ctx.replyWithHTML(
            `${isPendingDeletionFromGroup ? 'Пользователь ожидает окончания перемещения в группу. ' : ''}` +
            `Уверены, что хотите переместить его в группу <b>${newGroup.name}</b>${
                currentGroup ? ` из <b>${currentGroup.name}</b>` : ''}?`,
            adminKeyboards.setUserGroupConfirmKeyboard)
    })


    scene.action(AdminEvents.ON_CONFIRM_SET_USER_GROUP, async (ctx) => {
        const {
            currentGroup,
            newGroup,
            studentId
        } = ctx.scene.session.state


        await ctx.deleteMessage()

        const student = await Student.findByPk(studentId, {
            include: [
                {model: Group, as: 'group',},
                {model: TgUser, as: 'user',},
            ],
        })

        if (!student || !student.nlognId) {
            await ctx.reply('Непредиденная ошибка, попробуйте заново.')
            return ctx.scene.leave()
        }

        const courses = await Course.findAll({
            where: {
                isVisible: true
            }
        })

        const result = await setUserGroup(student, newGroup, courses)
        switch (result.status) {
        case MovingStatus.STUDENT_ALREADY_IN_GROUP:
            await ctx.reply(`Ошибка: Студент уже состоит в группе ${newGroup.name} на NLogN.`)
            return ctx.scene.leave()
        case MovingStatus.STUDENT_NOT_IN_GROUP:
            await ctx.reply(`Ошибка: Студент не состоит в группе ${currentGroup?.name} на NlogN.`)
            return ctx.scene.leave()
        case MovingStatus.OK:
            await ctx.reply('Ученик успешно перенаправлен в группу.')
            return ctx.scene.leave()
        }
    })

    scene.action(AdminEvents.ON_NOT_CONFIRM_SET_USER_GROUP, async (ctx) => {
        await ctx.deleteMessage()
        return ctx.scene.leave()
    })
}

export const setUserGroupSerial = [
    findStudentAndGroupSceneGen,
    setUserGroupSceneGen
]