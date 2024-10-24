import db from "../../src/db"
import {Student, TgUser} from "../../src/models"
import {Op} from "sequelize"
import {bot} from "../../src/start"
import {Telegraf} from "telegraf"
import {BotContext} from "../../src/types"
import { delay } from "../../src/utils"

//NODE_ENV=development BOT_TOKEN=<token> node -e "require('ts-node/register');require('./utils/scripts/mosBanStudents.ts').run().then(()=> {console.log('Done');});"


const studentIds = [127, 145, 404, 465, 461, 483, 506, 550, 600, 633, 668, 667, 689, 685, 734, 771, 626, 866, 893, 900, 784, 957]

export async function run() {
    if (!process.env.BOT_TOKEN || !process.env.NODE_ENV)
        throw new Error('NODE_ENV or BOT_TOKEN is not found')
    const bot =  new Telegraf<BotContext>(process.env.BOT_TOKEN)
    const users = (await db.models.TgUser.findAll({
        include: {
            model: Student,
            as: 'student',
            where: {
                id: {
                    [Op.in]: studentIds
                }
            }
        }
    })) as TgUser[]

    for (const user of users) {
        try {
            await user.update({
                is_banned: true,
            })
            await bot.telegram.sendMessage(user.tg_id,
                "❗️Уважаемый участник, вы были заблокированы по решению администратора. Это связано с тем, что вы учитесь в московской школе, хотя и ответили обратное на соответствующий вопрос бота. Если вы не согласны с этим решением, то напишите на @nlognsupport.",
                {
                    parse_mode: "HTML"
                })
        
            console.log(`sended to ${user.id}`)
        } catch (e) {
            console.log(e)
            console.log(`not sended to ${user.id}`)    
        }
        
        await delay(150)
    }
}