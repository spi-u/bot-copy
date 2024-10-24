import Scene from "../scene"
import {SceneView} from "../types"
import {BotContextMessageUpdate} from "../../types"
import {BaseScene} from "telegraf/typings/scenes"
import {bot} from "../../start"
import xlsx from "node-xlsx"
import {CfAccount, CfAccountCreationAttributes} from "../../models/CfAccount"
import {intersection} from "lodash"
import fs from "fs"
import path from "path"

export class LoadCfAccountsScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            const exampleFile = fs.readFileSync(path.join(process.cwd(), 'files/accounts_example.xlsx'))
            await ctx.reply('Прикрепите файл с данными о аккаунтах cf в формате xlsx:')
            return ctx.replyWithDocument({source: exampleFile, filename: 'Пример загрузки аккаунтов.xlsx'})
        })

        this.scene.on('document', async (ctx) => {
            const buffer = await bot.getFileBuffer(ctx.message.document.file_id)
            const currentAccounts = await CfAccount.findAll()

            const workSheets = xlsx.parse(buffer)
            const accountsData: string[][] = workSheets[0].data

            const matchedAccounts = intersection(
                currentAccounts.map(account => account.handle),
                accountsData.map(data => data[0])
            )
            // TODO: если аккаунтов много, не надо отправлять подробно
            if (matchedAccounts.length) {
                return ctx.reply(`Следующие аккаунты уже загружены: \n` +
                    `${matchedAccounts.slice(0, 50).join('; ')}`)
            }


            const accounts: CfAccountCreationAttributes[] = []
            for (const accountData of accountsData) {
                accounts.push({
                    handle: accountData[0],
                    password: accountData[1],
                    isActive: true,
                })
            }
            await CfAccount.bulkCreate(accounts)

            await ctx.replyWithMarkdown('Аккаунты успешно загружены.')
            return ctx.scene.leave()
        })

        return this.scene
    }

}