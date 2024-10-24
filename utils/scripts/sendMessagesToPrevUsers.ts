import db from "../../src/db"
import {Student, TgUser} from "../../src/models"
import {Model, Op, WhereOptions} from "sequelize"
import {bot} from "../../src/start"
import {Telegraf} from "telegraf"
import {BotContext} from "../../src/types"
import { delay } from "../../src/utils"
import csv from 'async-csv'
import fs from "fs/promises";
import path from "path";
import {intersection} from "lodash";

//NODE_ENV=development BOT_TOKEN=<token> node -e "require('ts-node/register');require('./utils/scripts/sendMessagesToPrevUsers.ts').run().then(()=> {console.log('Done');});"

export async function run() {
  if (!process.env.BOT_TOKEN || !process.env.NODE_ENV)
    throw new Error('NODE_ENV or BOT_TOKEN is not found')
  const bot =  new Telegraf<BotContext>(process.env.BOT_TOKEN)

  const csvString = await fs.readFile(path.join(process.cwd(), 'files/TgUsers.csv'), 'utf-8');

  // Convert CSV string into rows:
  const rows: any[] = await csv.parse(csvString);
  const tgIds: string[] = rows.slice(2529).map(row => row[1])
  const users = await db.models.TgUser.findAll({
      where: {
        tg_id: {
          [Op.in]: tgIds
        }
      } as WhereOptions<TgUser>,
  })
  const blackListStudents = intersection(users.map((item: any) => item.tg_id), tgIds) as string[]
  let counter = 0
  for (const tgId of tgIds) {
    if (!blackListStudents.includes(tgId)) {
      try {
        await bot.telegram.sendMessage(
          tgId,
          'Привет! Видим, ты всё еще не зарегистрировался на кружки этого года. Скорее вводи команду /start и следуй инструкциям бота. Занятия начинаются уже на этой неделе!\n' +
          'А по всем вопросам можешь написать нам - @nlognsupport', {
            parse_mode: "HTML"
          })
        counter++
      } catch (e) {
        console.log(`cannot send to ${tgId}`)
        console.log(e)
      }
      await delay(100)
    }
  }

  console.log(`sent to ${counter} users`)
}