import Scene from "../../scene"
import {SceneView} from "../../types"
import {BaseScene} from "telegraf/typings/scenes"
import {BotContextMessageUpdate} from "../../../types"
import {Group, Student, TgUser} from "../../../models"
import {Op, Sequelize} from "sequelize"
import {createStudentsInfo} from "../utils"


export class FindUserByNameScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            return ctx.reply('Введите имя и фамилию: ')
        })

        this.scene.on('text', async (ctx) => {
            const input = ctx.message.text

            const [firstName, lastName] = input.split(' ')

            if (!lastName) {
                return ctx.reply('Вы не ввели фамилию. Введите еще раз:')
            }

            const students = await Student.findAll({
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('firstName')), 'LIKE', '%' + firstName.toLowerCase() + '%'),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('lastName')), 'LIKE', '%' + lastName.toLowerCase() + '%'),
                    ]
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
                ],
                order: [
                    ['createdAt', 'ASC']
                ]
            })

            if (students.length === 0) {
                await ctx.reply('Пользователей с таким именем и фамилией не найдено.')
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