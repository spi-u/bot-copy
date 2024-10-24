import {Markup} from "telegraf"
import moment from "moment"

export enum RatingEvents {
    ON_GET_FULL_TABLE = 'ON_GET_FULL_TABLE',
    ON_GET_MONTH_TABLE = 'ON_GET_MONTH_TABLE',
}

const createTimeSelectKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('За все время', RatingEvents.ON_GET_FULL_TABLE)],
    [Markup.button.callback(`За текущий месяц`, RatingEvents.ON_GET_MONTH_TABLE)],
])

const createOpenTableKeyboard = (url: string) => Markup.inlineKeyboard([
    [Markup.button.url('Открыть', url)]
])

export const ratingKeyboards = {
    createTimeSelectKeyboard,
    createOpenTableKeyboard
}