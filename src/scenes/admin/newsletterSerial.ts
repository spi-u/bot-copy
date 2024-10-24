import { SerialSceneGenerator } from '../types'
import {AdminEvents, adminKeyboards} from '../../keyboards/adminKeyboard'
import { Group, Student, TgUser } from '../../models'
import { delay } from '../../utils/'
import { bot } from '../../start'
import { groupKeyboards } from '../../keyboards/groupKeyboard'
import xlsx from "node-xlsx"
import { Op } from 'sequelize'
import fs from "fs"
import path from "path"

const sendingIntervalMs = 100

export enum NewsletterType {
    TO_NOT_AUTH = 'TO_NOT_AUTH',
    TO_AUTH = 'TO_AUTH',
    TO_GROUPS = 'TO_GROUPS',
    TO_IDS = 'TO_IDS',
}

enum NewsletterMessageType {
    TEXT = 'TEXT',
    PHOTO = 'PHOTO'
}

export interface SendMessagesState {
    type: NewsletterType,
    telegramIds?: number[]
    message?: any
    messageType?: NewsletterMessageType
}


async function sendToUsers(telegramIds: number[], messageType: NewsletterMessageType, message: any): Promise<number> {
    const telegram = bot.bot.telegram
    let sendingCounter = 0
    for (const telegramId of telegramIds) {
        try {
            if (messageType === NewsletterMessageType.TEXT) {
                await telegram.sendMessage(telegramId, message.text, {
                    entities: message.entities
                })
            } else if (messageType === NewsletterMessageType.PHOTO) {
                await telegram.sendPhoto(telegramId, message.photo[message.photo.length - 1].file_id, {
                    caption: message.caption,
                    caption_entities: message.caption_entities
                })
            }
            sendingCounter++
        } catch (e) {
            console.log(e)
        }
        await delay(sendingIntervalMs)
    }

    return sendingCounter
}

const sendMessagesSceneGen: SerialSceneGenerator<SendMessagesState> = (scene) => {
    scene.enter(async (ctx) => {
        switch (ctx.scene.session.state.type) {
            case NewsletterType.TO_NOT_AUTH:
                ctx.scene.session.state.telegramIds = (await TgUser.findAll({
                    attributes: ['id', 'tg_id'],
                    include: {
                        attributes: ['id', 'userId', 'isAuthenticated'],
                        model: Student,
                        as: 'student',
                        where: {
                            isAuthenticated: false
                        }
                    }
                })).map(user => user.tg_id)
                break;
            case NewsletterType.TO_AUTH:
                ctx.scene.session.state.telegramIds = (await TgUser.findAll({
                    attributes: ['id', 'tg_id'],
                    include: {
                        attributes: ['id', 'userId', 'isAuthenticated'],
                        model: Student,
                        as: 'student',
                        where: {
                            isAuthenticated: true
                        }
                    }
                })).map(user => user.tg_id)
                break;
            case NewsletterType.TO_GROUPS:
                const groups = await Group.findAll({
                    where: {
                        isVisible: true,
                    },
                    order: ['indexInList']
                })
                return ctx.reply('Выберите группу:', groupKeyboards.createListKeyboard(groups))
            case NewsletterType.TO_IDS:
                const exampleFile = fs.readFileSync(path.join(process.cwd(), 'files/newsletter_example.xlsx'))
                return ctx.replyWithDocument({source: exampleFile, filename: 'Пример файла для рассылки.xlsx'}, {
                    caption: 'Прикрепите файл с ID учеников (в формате xlsx):'
                })
        }

        if (ctx.scene.session.state.telegramIds.length) {
            return ctx.reply('Введите сообщение рассылки:', adminKeyboards.cancelNewsletterKeyboard)
        }

        await ctx.reply('Получатели не найдены')
        return ctx.scene.leave()
    })

    scene.action(/ON_GROUP_SELECT_(.*)/i, async (ctx) => {
        if (ctx.scene.session.state.type === NewsletterType.TO_GROUPS) {
            const users = await TgUser.findAll({
                attributes: ['id', 'tg_id'],
                include: {
                    model: Student,
                    as: 'student',
                    where: {
                        groupId: ctx.match[1]
                    },
                    attributes: ['id', 'groupId', 'userId']
                }
            })
            ctx.scene.session.state.telegramIds = users.map(user => user.tg_id)
            if (ctx.scene.session.state.telegramIds.length) {
                return ctx.reply('Введите сообщение рассылки:', adminKeyboards.cancelNewsletterKeyboard)
            }
    
            await ctx.reply('Получатели не найдены')
            return ctx.scene.leave()
        }
    })

    scene.on('document', async (ctx) => {
        if (ctx.scene.session.state.type === NewsletterType.TO_IDS) {
            const buffer = await bot.getFileBuffer(ctx.message.document.file_id)

            const workSheets = xlsx.parse(buffer)
            const workSheetsData: number[][] = workSheets[0].data
            const studentsIds = workSheetsData.map(row => row[0])

            const users = await TgUser.findAll({
                include: {
                    model: Student,
                    as: 'student',
                    where: {
                        id: {
                            [Op.in]: studentsIds
                        }
                    }
                }
            })
            ctx.scene.session.state.telegramIds = users.map(user => user.tg_id)
            if (ctx.scene.session.state.telegramIds.length) {
                return ctx.reply('Введите сообщение рассылки:', adminKeyboards.cancelNewsletterKeyboard)
            }
    
            await ctx.reply('Получатели не найдены')
            return ctx.scene.leave()
        }
    })

    scene.on('message', async (ctx) => {
        if (ctx.scene.session.state.telegramIds?.length) {
            const message = ctx.message
            let messageType: NewsletterMessageType;
            if ('text' in message) {
                messageType = NewsletterMessageType.TEXT
            } else if ('photo' in message) {
                messageType = NewsletterMessageType.PHOTO
            } else {
                await ctx.replyWithHTML('Данный вид сообщения не поддерживается для рассылки.')
                return ctx.scene.leave()
            }
            
            ctx.scene.session.state.message = message
            ctx.scene.session.state.messageType = messageType
            return ctx.replyWithHTML(`Вы уверены, что хотите отправить сообщение <code>${ctx.scene.session.state.telegramIds.length}</code> пользователям?`, {
                reply_markup: adminKeyboards.confirmNewsletterKeyboard.reply_markup,
                reply_to_message_id: message.message_id
            })
        }
    })

    scene.action(AdminEvents.ON_CONFIRM_NEWSLETTER, async (ctx) => {
        if (ctx.scene.session.state.message 
            && ctx.scene.session.state.messageType 
            && ctx.scene.session.state.telegramIds?.length) {
            await ctx.editMessageReplyMarkup(undefined)
            
            await ctx.reply('Подождите, идет отправка...')
            const sendingResult = await sendToUsers(ctx.scene.session.state.telegramIds, ctx.scene.session.state.messageType, ctx.scene.session.state.message)

            await ctx.replyWithHTML(`Отправлено <code>${sendingResult}/${ctx.scene.session.state.telegramIds.length}</code> найденным пользователям!`)
            return ctx.scene.leave()
        }
    })

    scene.action(AdminEvents.ON_CANCEL_NEWSLETTER, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.leave()
    })

}

export const newsletterSerial = [
    sendMessagesSceneGen
]