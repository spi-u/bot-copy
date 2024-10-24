import Scene from "../scene";
import {SceneView} from "../types";
import {BaseScene} from "telegraf/typings/scenes";
import {BotContextMessageUpdate} from "../../types";
import {TgUser} from "../../models";
import {AdminEvents, adminKeyboards} from "../../keyboards/adminKeyboard";

interface SceneState {
    userId: number | undefined
}
export class UserAdminScene extends Scene<BotContextMessageUpdate<SceneState>> implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async(ctx) => {
            return ctx.reply('Введите никнейм пользователя без @ (учтите, что пользователь должен состоять в боте): ')
        })

        this.scene.on('text', async (ctx) => {
            if (ctx.scene.session.state.userId) {
                return
            }

            const input = ctx.message.text
            const user = await TgUser.findOne({
                where: {
                    tg_username: input
                }
            })

            if (!user) {
                await ctx.reply('Пользователь с таким никнеймом не найден.')
                return ctx.scene.leave()
            }

            ctx.scene.session.state.userId = user.id
            return ctx.replyWithHTML(
                'Пользователь найден: \n' +
                `<b>Имя Фамилия:</b> ${user.tg_first_name} ${user.tg_last_name} \n` +
                `<b>Никнейм:</b> @${user.tg_username} \n`,
                adminKeyboards.addAdminConfirmKeyboard
            )
        })

        this.scene.action(AdminEvents.ON_CONFIRM_ADD_ADMIN, async (ctx) => {
            const user = await TgUser.findByPk(ctx.scene.session.state.userId)
            if (!user)
                throw new Error('User is not found.')

            await user.update({
                is_admin: true
            })

            await ctx.reply('Успешно.')

            return ctx.scene.leave()
        })

        this.scene.action(AdminEvents.ON_CONFIRM_REMOVE_ADMIN, async (ctx) => {
            const user = await TgUser.findByPk(ctx.scene.session.state.userId)
            if (!user)
                throw new Error('User is not found.')

            await user.update({
                is_admin: false
            })

            await ctx.reply('Успешно.')
            return ctx.scene.leave()
        })

        this.scene.action(AdminEvents.ON_NOT_CONFIRM_USER_ADMIN, async (ctx) => {
            await ctx.deleteMessage()
            return ctx.scene.leave()
        })

        return this.scene
    }
}