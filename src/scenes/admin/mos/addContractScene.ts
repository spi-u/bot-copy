import Scene from "../../scene";
import {SceneView} from "../../types";
import {BaseScene} from "telegraf/typings/scenes";
import {BotContextMessageUpdate} from "../../../types";
import {MosContract, MosStatus} from "../../../models";


export class AddContractScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            return ctx.replyWithHTML('Введите номер заявления: ')
        })

        this.scene.on('text', async (ctx) => {
            const input = ctx.message.text
            if (!Number.isInteger(Number(ctx.message.text))) {
                await ctx.reply('Номер заявления введен некорректно')
                return ctx.scene.leave()
            }

            await MosContract.create({
                mosId: input,
                status: MosStatus.ACCEPTED,
                mosContractId: 'no contract id',
                groupCode: 0,
                studentName: 'no name',
                isActive: true
            })

            await ctx.reply('Номер заявления успешно добавлен.')
            return ctx.scene.leave()
        })
        return this.scene
    }

}