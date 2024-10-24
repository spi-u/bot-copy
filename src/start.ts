import { startDB } from './db'
import { ConfigService } from './services'
import { ContestsService } from './services'
import { CfService } from './services'
import Bot from './bot'
import TaskManager from './tasks/task'
import { deleteStudentsFromGroup } from './tasks/deleteStudentsFromPrevGroupTask'
import path from 'path'
import BotI18n from './boti18n'
import * as YAML from 'yaml'
import { GoogleSheetsService } from './services'
import { ratingTablesUpdate } from './tasks/ratingTableUpdateTask'

export const configService = new ConfigService()
export const contestsService = new ContestsService(configService)
export const cfService = new CfService(configService)
export const googleSheetsService = new GoogleSheetsService(configService)

const i18n = new BotI18n({
    locales: ['ru'],
    defaultLocale: 'ru',
    directory: path.join(__dirname, '../locales'),
    extension: '.yml',
    parser: YAML,
    objectNotation: true,
})

const deletionStudentsFromGroupTask = new TaskManager(
    'Deletion Students From Group',
    deleteStudentsFromGroup,
    60 * 1000,
)
const ratingTableUpdateTask = new TaskManager(
    'Rating Table Update',
    ratingTablesUpdate,
    5 * 60 * 1000,
)

export let bot: Bot
const launchApp = async () => {
    await startDB()

    bot = new Bot(configService, i18n)
    bot.init()

    deletionStudentsFromGroupTask.start()
    ratingTableUpdateTask.start()
}

launchApp()
