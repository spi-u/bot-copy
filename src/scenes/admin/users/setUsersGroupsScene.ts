import Scene from "../../scene"
import {SceneView} from "../../types"
import {BaseScene} from "telegraf/typings/scenes"
import {BotContextMessageUpdate} from "../../../types"
import {bot, contestsService} from "../../../start"
import xlsx from "node-xlsx"
import {Group, Student, TgUser} from "../../../models"
import * as fs from "fs"
import path from "path"
import {Course} from "../../../models/Course";
import {createMainKeyboard} from "../../../keyboards/mainKeyboard"
import {canSelectAnotherCourse, isWithRatings} from "../../../utils/courses"
import { delay } from "../../../utils"

export const deletionFromGroupIntervalInMs = 1000 * 60 * 60 * 24 * 3
// export const deletionFromGroupIntervalInMs = 1000 * 10

export enum MovingStatus {
    OK,
    STUDENT_ALREADY_IN_GROUP,
    STUDENT_NOT_IN_GROUP,
    MESSAGE_SEND_ERROR
}

export async function setUserGroup(student: Student, newGroup: Group, courses: Course[]) {
    let isDeletionWarningShow: boolean

    if (student.isPendingDeletionFromGroup) {
        if (student.group) {
            const removeResult = await contestsService.removeUserFromGroup(student.group.nlognId, student.nlognId)

            await bot.telegram.sendMessage(
                student.user.tg_id,
                bot.__('deleted_from_group', {
                    name: student.group.name
                }),
                {parse_mode: "HTML"}
            )

            if (removeResult === null) {
                return {
                    status: MovingStatus.STUDENT_NOT_IN_GROUP
                }
            }
            if (student.prevGroupId !== newGroup.id) {
                await contestsService.addUserToGroup(newGroup.nlognId, student.nlognId)
            } else {
                student.isPendingDeletionFromGroup = false
                student.fromGroupDeletionTimerEnd = null
            }
        } else {
            throw new Error(`Current group is not found.`)
        }

        isDeletionWarningShow = false
    } else {
        const additionResult = await contestsService.addUserToGroup(newGroup.nlognId, student.nlognId)
        if (additionResult === null) {
            return {
                status: MovingStatus.STUDENT_ALREADY_IN_GROUP
            }
        }
        if (student.group) {
            student.isPendingDeletionFromGroup = true
            student.fromGroupDeletionTimerEnd = new Date(Date.now() + deletionFromGroupIntervalInMs)
            student.prevGroupId = student.group.id

            isDeletionWarningShow = true
        } else {
            isDeletionWarningShow = false
        }
    }

    student.groupId = newGroup.id
    await student.save()

    const studentCourses = await student.getCourses()
    const coursesList = studentCourses.map(c => `<code>${c.name}</code>`).join(', ')
    await bot.telegram.sendMessage(
        student.user.tg_id,
        bot.__('group_info', {
            name: newGroup.name,
            courses: coursesList,
        }),
        {
            parse_mode: "HTML",
            reply_markup: createMainKeyboard(
                isWithRatings(studentCourses),
                canSelectAnotherCourse(courses, studentCourses, newGroup.isSimple)
            ).reply_markup
        }
    )
    if (isDeletionWarningShow) {
        await bot.telegram.sendMessage(
            student.user.tg_id,
            bot.__('deletion_from_group_warning', {
                name: (student.group as Group).name
            }),
            {parse_mode: "HTML"}
        )
    }

    return {
        status: MovingStatus.OK
    }
}

export class SetUsersGroupsScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            const exampleFile = fs.readFileSync(path.join(process.cwd(), 'files/move_students_example.xlsx'))
            await ctx.reply('Прикрепите файл с данными о пользователе и группе в формате xlsx:')
            return ctx.replyWithDocument({source: exampleFile, filename: 'Пример таблицы перевода в группы.xlsx'})
        })

        this.scene.on('document', async (ctx) => {
            const pendingMessage = await ctx.reply('Ожидайте, загружается...')
            const buffer = await bot.getFileBuffer(ctx.message.document.file_id)

            const workSheets = xlsx.parse(buffer)
            const document: number[][] = workSheets[0].data

            const notFoundStudentsId: Set<number> = new Set()
            const notFoundGroupsId: Set<number> = new Set()
            const notHavingAccountStudentsId: Set<number> = new Set()
            const alreadyInGroupStudentsId: Set<number> = new Set()
            const alreadyInNlognGroupStudentsId: Set<number> = new Set()
            const notInNlognGroupStudentsId: Set<number> = new Set()
            const messageSendWithErrorStudentsId: Set<number> = new Set() 
            const movedStudentsId: Set<number> = new Set()

            const courses = await Course.findAll({
                where: {
                    isVisible: true
                }
            })
            for (const [studentId, nlognGroupId] of document) {
                const student = await Student.findByPk(studentId, {
                    include: [
                        {model: Group, as: 'group',},
                        {model: TgUser, as: 'user',},
                    ],
                })

                if (!student) {
                    notFoundStudentsId.add(studentId)
                    continue
                }

                const newGroup = await Group.findOne({
                    where: {nlognId: nlognGroupId,}
                })


                if (!newGroup) {
                    notFoundGroupsId.add(nlognGroupId)
                    continue
                }

                if (!student.nlognId) {
                    notHavingAccountStudentsId.add(student.id)
                    continue
                }

                if (student.group?.nlognId === nlognGroupId) {
                    alreadyInGroupStudentsId.add(student.id)
                    continue
                }
                
                let result
                try {
                    result = await setUserGroup(student, newGroup, courses)        
                } catch (error) {
                    console.log(error)
                    result = {
                        status: MovingStatus.MESSAGE_SEND_ERROR
                    }
                }
            

                switch (result.status) {
                case MovingStatus.STUDENT_ALREADY_IN_GROUP:
                    alreadyInNlognGroupStudentsId.add(student.id)
                    break
                case MovingStatus.STUDENT_NOT_IN_GROUP:
                    notInNlognGroupStudentsId.add(student.id)
                    break
                case MovingStatus.MESSAGE_SEND_ERROR:
                    messageSendWithErrorStudentsId.add(student.id)
                    break
                case MovingStatus.OK:
                    movedStudentsId.add(student.id)
                    break
                }

                await delay(200)
            }

            await ctx.deleteMessage(pendingMessage.message_id)

            if (notFoundStudentsId.size) {
                await ctx.reply(
                    `Следующие ученики не найдены в базе: ${Array.from(notFoundStudentsId).join('; ')}`
                )
            }

            if (notFoundGroupsId.size) {
                await ctx.reply(
                    `Следующие группы не найдены в базе: ${Array.from(notFoundGroupsId).join('; ')}`
                )
            }

            if (notHavingAccountStudentsId.size) {
                await ctx.reply(
                    `Следующие ученики не привязаны к аккаунту NlogN: ${Array.from(notFoundGroupsId).join('; ')}`
                )
            }

            if (alreadyInGroupStudentsId.size) {
                await ctx.reply(
                    `Следующие ученики уже состоят в группах: ${Array.from(alreadyInGroupStudentsId).join('; ')}`
                )
            }

            if (alreadyInNlognGroupStudentsId.size) {
                await ctx.reply(
                    `Следующие ученики уже состоят в группе в NlogN: ${Array.from(notFoundGroupsId).join('; ')}`
                )
            }

            if (notInNlognGroupStudentsId.size) {
                await ctx.reply(
                    `Следующие ученики должны были быть удалены из групп NlogN, чтобы переместиться в новую, но их не оказалось в группах: ${Array.from(notFoundGroupsId).join('; ')}`
                )
            }

            if (messageSendWithErrorStudentsId.size) {
                await ctx.reply(
                    `ССледующим ученикам не удалось отправить сообщение: ${Array.from(notFoundGroupsId).join('; ')}`
                )
            }

            if (movedStudentsId.size) {
                await ctx.reply(
                    `Успешно перемещены следующие ученики: ${Array.from(movedStudentsId).join('; ')}`
                )
            }
        })

        return this.scene
    }
}