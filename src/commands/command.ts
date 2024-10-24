import { Telegraf } from 'telegraf'
import { BotContext } from '../types'

export abstract class Command {
    protected constructor(public bot: Telegraf<BotContext>) {}

    abstract handle(): void
}
