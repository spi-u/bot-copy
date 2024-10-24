import {Markup} from "telegraf"
import {Group} from "../models";


export enum CfEvents {
    ON_RELOAD_SCENE = 'ON_RELOAD_SCENE',
    ON_CONTEST_CHECK = 'ON_CONTEST_CHECK',
    ON_GROUP_CONFIRM = 'ON_GROUP_CONFIRM',
    ON_CONFIRMED_CONTEST_CHECK = 'ON_CONFIRMED_CONTEST_CHECK',
    ON_NOT_CONFIRMED_CONTEST_CHECK = 'ON_NOT_CONFIRMED_CONTEST_CHECK',
}

const reloadSceneKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Попробовать заново', CfEvents.ON_RELOAD_SCENE)
])

const createContestUrlKeyboard = (url: string) => Markup.inlineKeyboard([
    [Markup.button.url('Открыть контест', url)],
])

const contestCheckKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Я закончил', CfEvents.ON_CONTEST_CHECK)]
])

const confirmContestCheckKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да, я точно закончил', CfEvents.ON_CONFIRMED_CONTEST_CHECK)],
    [Markup.button.callback('Нет, я еще решаю', CfEvents.ON_NOT_CONFIRMED_CONTEST_CHECK)]
])

const createGroupsListKeyboard = (groups: Group[]) => Markup.inlineKeyboard(
    groups.map(group => [Markup.button.callback(group.name, `${CfEvents.ON_GROUP_CONFIRM}_${group.id}`)])
)


export const cfKeyboards = {
    reloadSceneKeyboard,
    createContestUrlKeyboard,
    contestCheckKeyboard,
    confirmContestCheckKeyboard,
    createGroupsListKeyboard
}