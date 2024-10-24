import {Markup} from "telegraf"

export enum MainKeyboardButtons {
    PROFILE = 'Профиль',
    TEACHERS = 'Мои преподаватели',
    LECTURE_NOTES = 'Записи прошлых лекций',
    GROUP_CHATS = 'Мои чаты',
    RATING_TABLE = 'Рейтинг',
    SELECT_ANOTHER_COURSES = 'Выбрать еще направления'
}

export const createMainKeyboard = (withRatings: boolean, canSelectAnotherCourse: boolean) => {
    let buttons = [
        MainKeyboardButtons.PROFILE,
        MainKeyboardButtons.TEACHERS,
        MainKeyboardButtons.LECTURE_NOTES,
        MainKeyboardButtons.GROUP_CHATS,
    ]

    if (withRatings)
        buttons.push(MainKeyboardButtons.RATING_TABLE)

    if (canSelectAnotherCourse)
        buttons = [MainKeyboardButtons.SELECT_ANOTHER_COURSES, ...buttons]

    return Markup.keyboard(buttons)
}