import {Markup} from "telegraf"

export enum MosEvents {
    ON_MOSCOW_CONFIRMED = 'ON_MOSCOW_CONFIRMED',
    ON_MOSCOW_NOT_CONFIRMED = 'ON_MOSCOW_NOT_CONFIRMED',
    CONTINUE = 'CONTINUE',
    SELECT_COURSE = 'SELECT_COURSE',
    ON_RETRY = 'ON_RETRY',
    ON_GET_STATUS = 'ON_GET_STATUS'
}

const confirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', MosEvents.ON_MOSCOW_CONFIRMED)],
    [Markup.button.callback('Нет', MosEvents.ON_MOSCOW_NOT_CONFIRMED)],
])

const continueKeyboard = (canSelectAnotherCourse = true) => {
    const buttons = []

    // сейчас можно выбрать только одно направление на этапе регистрации
    // if (canSelectAnotherCourse) buttons.push([Markup.button.callback('Выбрать еще одно направление', MosEvents.SELECT_COURSE)]) 
    buttons.push([Markup.button.callback('Продолжить', MosEvents.CONTINUE)])
    return Markup.inlineKeyboard(buttons)
}

const waitingKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Я неправильно ввел', MosEvents.ON_RETRY)],
    [Markup.button.callback('Узнать статус', MosEvents.ON_GET_STATUS)],
])
export const mosKeyboards = {
    confirmKeyboard,
    continueKeyboard,
    waitingKeyboard,
}