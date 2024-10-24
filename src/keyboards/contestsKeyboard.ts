import {Markup} from "telegraf"

export enum ContestsEvents {
    ON_ACCOUNT_EXIST= 'ON_ACCOUNT_EXIST',
    ON_ACCOUNT_NOT_EXIST = 'ON_ACCOUNT_NOT_EXIST',
    ON_EDIT_EMAIL = 'ON_EDIT_EMAIL'
}

const confirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', ContestsEvents.ON_ACCOUNT_EXIST)],
    [Markup.button.callback('Нет', ContestsEvents.ON_ACCOUNT_NOT_EXIST)],
])

const emailExistKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Изменить почту', ContestsEvents.ON_EDIT_EMAIL)],
    [Markup.button.callback('Использовать существующий аккаунт', ContestsEvents.ON_ACCOUNT_EXIST)],
])

export const contestsKeyboards = {
    confirmKeyboard,
    emailExistKeyboard,
}