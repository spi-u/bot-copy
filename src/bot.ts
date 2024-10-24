import axios from 'axios'
import { Markup, Scenes, Telegraf, Telegram } from 'telegraf'
import { BotContext } from './types'
import { Command } from './commands/command'
import { ConfigServiceView } from './services/types'
import { createScenes } from './scenes'
import { sessionDbMiddleware } from './middlewares/sessionDbMiddleware'
import { authMiddleware } from './middlewares/authMiddleware'
import { AdminCommand, StartCommand } from './commands'
import BotI18n from './boti18n'
import { ProfileCommand } from './commands/profileCommand'
import { TeachersCommand } from './commands/teachersCommand'
import { LectureNotesCommand } from './commands/lectureNotesCommand'
import { Replacements, TranslateOptions } from 'i18n'
import { RatingTableCommand } from './commands/ratingTableCommand'
import { logsMiddleware } from './middlewares/logsMiddleware'
import { ChatsCommand } from './commands/chatsCommand'
import { SelectAnotherCourseCommand } from './commands/selectAnotherCourseCommand'
import { logger } from './services'
import { deleteMsgMiddleware } from './middlewares/deleteMsgMiddleware'
import { commandsMiddleware } from './middlewares/commandsMiddleware'

class Bot {
    bot: Telegraf<BotContext>
    telegram: Telegram
    stage: Scenes.Stage<any>
    commands: Command[] = []
    i18n: BotI18n

    constructor(
        private readonly configService: ConfigServiceView,
        i18n: BotI18n,
    ) {
        this.bot = new Telegraf<BotContext>(this.configService.get('botToken'))
        this.telegram = this.bot.telegram
        const scenes = createScenes()
        this.stage = new Scenes.Stage<any>(scenes)
        this.i18n = i18n
    }

    init() {
        this.bot.use(sessionDbMiddleware())
        this.bot.use(authMiddleware())
        this.bot.use(logsMiddleware())
        this.bot.use(this.i18n.middleware())
        this.bot.use(this.stage.middleware())
        this.bot.use(deleteMsgMiddleware())
        this.bot.use(commandsMiddleware())

        this.bot.catch(async (err, ctx) => {
            logger.error(err)

            try {
                if (ctx.session.__scenes && ctx.session.__scenes.current) {
                    await ctx.sendMessage(
                        this.__('errors.unexpected_error'),
                        Markup.inlineKeyboard([
                            Markup.button.callback('Перезагрузить', 'reload_scene'),
                        ]),
                    )
                } else {
                    await ctx.sendMessage(this.__('errors.unexpected_error'))
                }
            } catch (e) {
                console.log(e)
            }
        })

        this.bot.action('reload_scene', async (ctx) => {
            if (ctx.session.__scenes && ctx.session.__scenes.current) {
                await ctx.deleteMessage()
                return ctx.scene.enter(ctx.session.__scenes.current)
            }
        })

        this.commands = [
            new StartCommand(this.bot),
            new ProfileCommand(this.bot),
            new TeachersCommand(this.bot),
            new LectureNotesCommand(this.bot),
            new ChatsCommand(this.bot),
            new RatingTableCommand(this.bot),
            new AdminCommand(this.bot),
            new SelectAnotherCourseCommand(this.bot),
        ]
        for (const command of this.commands) {
            command.handle()
        }

        this.bot.launch()
    }

    async getFileBuffer(fileId: string): Promise<Buffer> {
        const fileUrl = await this.bot.telegram.getFileLink(fileId)
        const response = await axios.get(fileUrl.href, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'utf-8')
        return buffer
    }

    __(
        phraseOrOptions: string | TranslateOptions,
        replace: Replacements | undefined = undefined,
    ): string {
        if (replace) return this.i18n._i18n.__(phraseOrOptions, replace)
        return this.i18n._i18n.__(phraseOrOptions)
    }
}

export default Bot
