import Scene from "../../scene"
import {SceneView} from "../../types"
import {BaseScene} from "telegraf/typings/scenes"
import {BotContextMessageUpdate} from "../../../types"
import {Group, Student, TgUser} from "../../../models"
import {Op} from "sequelize"
import {createStudentsInfo} from "../utils"


export class FindUserByEmailScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            return ctx.reply('Введите почту: ')
        })

        this.scene.on('text', async (ctx) => {
            const input = ctx.message.text

            const students = await Student.findAll({
                where: {
                    email: {
                        [Op.like]: `%${input}%`
                    },
                },
                include: [
                    {
                        model: Group,
                        as: 'group',
                    },
                    {
                        model: TgUser,
                        as: 'user'
                    }
                ]
            })

            if (students.length === 0) {
                await ctx.reply('Пользователей с такой почтой не найдено.')
                return ctx.scene.leave()
            }
            
            const slicedStudents = students.slice(0, 2)
            const studentsInfo = await createStudentsInfo(slicedStudents)
            for (const studentInfo of studentsInfo) {
                await ctx.replyWithHTML(studentInfo)
            }
            if (students.length > 2) {
                await ctx.replyWithHTML(`<i>И еще ${students.length - 2}...</i>`)
            }

            return ctx.scene.leave()
        })

        return this.scene
    }
}