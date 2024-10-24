import { NarrowedContext, Scenes } from 'telegraf'
import { SceneSession, SceneSessionData } from 'telegraf/src/scenes/context'
import { State } from './state'
import { SerialView } from './scenes/types'
import { Student, TgUser } from './models'
import { I18n } from 'i18n'

interface BotSession {
    state: State
}

interface BotSceneSessionData<D extends object> extends SceneSessionData {
    state: D
}

export interface BotContext<D extends object = any>
    extends Scenes.SceneContext<BotSceneSessionData<D>> {
    session: SceneSession<BotSceneSessionData<D>> & BotSession
    deleteMessageOrClearReplyMarkup: () => Promise<void>
    serial: SerialView
    student: Student
    tgUser: TgUser
    i18n: I18n
}

export type BotContextMessageUpdate<D extends object = any> = NarrowedContext<BotContext<D>, any>
