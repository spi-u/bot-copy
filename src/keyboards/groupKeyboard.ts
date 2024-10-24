import {Group} from "../models";
import {Markup} from "telegraf";


export enum GroupEvents {
    ON_GROUP_SELECT = 'ON_GROUP_SELECT',
    ON_CONFIRM_SIMPLE_GROUP = 'ON_CONFIRM_SIMPLE_GROUP',
    ON_NOT_CONFIRM_SIMPLE_GROUP = 'ON_NOT_CONFIRM_SIMPLE_GROUP',
}
const createListKeyboard = (groups: Group[]) => Markup.inlineKeyboard(
    groups.map(group => [Markup.button.callback(group.name, `${GroupEvents.ON_GROUP_SELECT}_${group.id}`)])
)

const confirmSimpleGroupKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', GroupEvents.ON_CONFIRM_SIMPLE_GROUP)],
    [Markup.button.callback('Нет', GroupEvents.ON_NOT_CONFIRM_SIMPLE_GROUP)],
])

export const groupKeyboards = {
    createListKeyboard,
    confirmSimpleGroupKeyboard,
}