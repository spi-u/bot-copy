import { Command } from './command'
import { Telegraf } from 'telegraf'
import { BotContext } from '../types'
import { MainKeyboardButtons } from '../keyboards/mainKeyboard'
import { RatingEvents, ratingKeyboards } from '../keyboards/ratingKeyboard'
import { contestsService } from '../start'
import { Group } from '../models'
import { getSheetUrl } from '../utils'
import { startKeyboards } from '../keyboards/startKeyboard'

export class RatingTableCommand extends Command {
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }
    handle() {
        this.bot.hears(MainKeyboardButtons.RATING_TABLE, async (ctx) => {
            if (!ctx.student.isAuthenticated) {
                return ctx.replyWithHTML(
                    ctx.i18n.__('not_auth'),
                    startKeyboards.startRegistrationKeyboard,
                )
            }

            const group = await Group.findByPk(ctx.student.groupId)
            if (!group) {
                throw new Error('Group is not found')
            }
            const contestsIds = await contestsService.getGroupContestsIds(group.nlognId)
            if (!contestsIds) return ctx.replyWithHTML(ctx.i18n.__('rating.contests_nof_found'))

            await ctx.replyWithHTML(
                ctx.i18n.__('rating.select'),
                ratingKeyboards.createTimeSelectKeyboard,
            )
        })

        this.bot.action(RatingEvents.ON_GET_FULL_TABLE, async (ctx) => {
            await ctx.deleteMessageOrClearReplyMarkup()
            const group = await Group.findByPk(ctx.student.groupId)
            if (!group) {
                throw new Error('Group is not found')
            }

            if (!group.ratingSpreadsheetsId) {
                throw new Error(`Rating table id is not found for group id=${group.id}`)
            }

            return ctx.replyWithHTML(
                ctx.i18n.__('rating.link'),
                ratingKeyboards.createOpenTableKeyboard(getSheetUrl(group.ratingSpreadsheetsId)),
            )
        })

        this.bot.action(RatingEvents.ON_GET_MONTH_TABLE, async (ctx) => {
            await ctx.deleteMessageOrClearReplyMarkup()
            const group = await Group.findByPk(ctx.student.groupId)
            if (!group) {
                throw new Error('Group is not found')
            }

            if (!group.ratingSpreadsheetsId || !group.monthSheetId) {
                throw new Error(`Rating table id is not found for group id=${group.id}`)
            }

            return ctx.replyWithHTML(
                ctx.i18n.__('rating.link'),
                ratingKeyboards.createOpenTableKeyboard(
                    getSheetUrl(group.ratingSpreadsheetsId, group.monthSheetId),
                ),
            )
        })
    }
}
