import {Markup} from "telegraf";

export enum UserInfoEvents {
    ON_USER_INFO_CORRECT = 'ON_USER_INFO_CORRECT',
    ON_USER_INFO_NOT_CORRECT = 'ON_USER_INFO_NOT_CORRECT',
}

const checkUserDataKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Все верно', UserInfoEvents.ON_USER_INFO_CORRECT)],
    [Markup.button.callback('Нет, хочу изменить', UserInfoEvents.ON_USER_INFO_NOT_CORRECT)],
])

export const userInfoKeyboards = {
    checkUserDataKeyboard,
}