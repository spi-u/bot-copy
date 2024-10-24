import {Markup} from "telegraf";

export enum StartEvents {
    ON_START_REGISTRATION = 'ON_START_REGISTRATION'
}

const startRegistrationKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Начать регистрацию', StartEvents.ON_START_REGISTRATION)
])

export const startKeyboards = {
    startRegistrationKeyboard
}