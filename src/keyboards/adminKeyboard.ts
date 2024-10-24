import {Markup} from "telegraf"


export enum AdminEvents {
    ON_OPEN_USER_MENU = 'ON_OPEN_USER_MENU',
    ON_OPEN_MOS_MENU = 'ON_OPEN_MOS_MENU',
    ON_OPEN_MAIN_MENU = 'ON_OPEN_MAIN_MENU',
    ON_OPEN_FIND_USER_MENU = 'ON_OPEN_FIND_USER_MENU',
    ON_MOS_LOAD = 'ON_MOS_LOAD',
    ON_CF_ACCOUNTS_LOAD = 'ON_CF_ACCOUNTS_LOAD',
    ON_SET_USER_GROUP = 'ON_SET_USER_GROUP',
    ON_SET_USERS_GROUPS = 'ON_SET_USERS_GROUPS',
    ON_GET_USERS = 'ON_GET_USERS',
    ON_FIND_USER_BY_NAME = 'ON_FIND_USER_BY_NAME',
    ON_FIND_USER_BY_USERNAME = 'ON_FIND_USER_BY_USERNAME',
    ON_FIND_USER_BY_EMAIL = 'ON_FIND_USER_BY_EMAIL',
    ON_CONFIRM_SET_USER_GROUP = 'ON_CONFIRM_SET_USER_GROUP',
    ON_NOT_CONFIRM_SET_USER_GROUP = 'ON_NOT_CONFIRM_SET_USER_GROUP',
    ON_CONFIRM_RESTART_USER = 'ON_CONFIRM_RESTART_USER',
    ON_NOT_CONFIRM_RESTART_USER = 'ON_NOT_CONFIRM_RESTART_USER',
    ON_BAN_USER = 'ON_BAN_USER',
    ON_CONFIRM_BAN_USER = 'ON_CONFIRM_BAN_USER',
    ON_NOT_CONFIRM_BAN_USER = 'ON_NOT_CONFIRM_BAN_USER',
    ON_UNBAN_USER = 'ON_UNBAN_USER',
    ON_CONFIRM_UNBAN_USER = 'ON_CONFIRM_UNBAN_USER',
    ON_NOT_CONFIRM_UNBAN_USER = 'ON_NOT_CONFIRM_UNBAN_USER',
    ON_OPEN_TABLE_MENU = 'ON_OPEN_TABLE_MENU',
    ON_GET_FULL_TABLE = 'ON_GET_FULL_TABLE',
    ON_GET_TABLES = 'ON_GET_TABLES',
    ON_GET_MONTH_TABLE = 'ON_GET_MONTH_TABLE',
    ON_USER_ADMIN = 'ON_USER_ADMIN',
    ON_USER_RESTART = 'ON_USER_RESTART',
    ON_CONFIRM_ADD_ADMIN = 'ON_CONFIRM_ADD_ADMIN',
    ON_CONFIRM_REMOVE_ADMIN = 'ON_CONFIRM_REMOVE_ADMIN',
    ON_NOT_CONFIRM_USER_ADMIN = 'ON_NOT_CONFIRM_USER_ADMIN',
    ON_TESTING = 'ON_TESTING',
    ON_DOWNLOAD_TABLE = 'ON_DOWNLOAD_TABLE',
    ON_MOS_ADD_CONTRACT = 'ON_MOS_ADD_CONTRACT',
    ON_MOS_GET_STATUS = 'ON_MOS_GET_STATUS',
    ON_OPEN_NEWSLETTER_MENU = 'ON_OPEN_NEWSLETTER_MENU',
    ON_SEND_AUTH = 'ON_SEND_AUTH',
    ON_SEND_NOT_AUTH = 'ON_SEND_NOT_AUTH',
    ON_SEND_GROUPS = 'ON_SEND_GROUPS',
    ON_SEND_IDS = 'ON_SEND_IDS',
    ON_CANCEL_NEWSLETTER = 'ON_CANCEL_NEWSLETTER',
    ON_GET_USERS_STATUS = 'ON_GET_USERS_STATUS',
    ON_CONFIRM_NEWSLETTER = 'ON_CONFIRM_NEWSLETTER',
    ON_DOWNLOAD_MOS = 'ON_DOWNLOAD_MOS'
}

const mainActionsKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Mos.ru', AdminEvents.ON_OPEN_MOS_MENU)],
    [Markup.button.callback('Загрузить аккаунты CF', AdminEvents.ON_CF_ACCOUNTS_LOAD)],
    [Markup.button.callback('Действия с пользователями', AdminEvents.ON_OPEN_USER_MENU)],
    [Markup.button.callback('Таблица результатов', AdminEvents.ON_GET_TABLES)],
    [Markup.button.callback('Рассылка', AdminEvents.ON_OPEN_NEWSLETTER_MENU)],
    [Markup.button.callback('Тестирование', AdminEvents.ON_TESTING)],
])

const mosActionsKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Загрузить реестр', AdminEvents.ON_MOS_LOAD)],
    [Markup.button.callback('Добавить номер заявления', AdminEvents.ON_MOS_ADD_CONTRACT)],
    [Markup.button.callback('Статус по ученикам', AdminEvents.ON_MOS_GET_STATUS)],
    [Markup.button.callback('Скачать последние реестры', AdminEvents.ON_DOWNLOAD_MOS)],
    [Markup.button.callback('⬅️ Вернуться', AdminEvents.ON_OPEN_MAIN_MENU)],
])

const userActionsKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Статистика по ученикам', AdminEvents.ON_GET_USERS_STATUS)],
    [Markup.button.callback('Скачать лист с учениками', AdminEvents.ON_GET_USERS)],
    [Markup.button.callback('Найти ученика в базе', AdminEvents.ON_OPEN_FIND_USER_MENU)],
    [Markup.button.callback('Переместить ученика в другую группу', AdminEvents.ON_SET_USER_GROUP)],
    [Markup.button.callback('Переместить пул учеников в другую группу', AdminEvents.ON_SET_USERS_GROUPS)],
    [Markup.button.callback('Выдать/забрать права администратора', AdminEvents.ON_USER_ADMIN)],
    [Markup.button.callback('Перезагрузить пользователя', AdminEvents.ON_USER_RESTART)],
    [Markup.button.callback('Заблокировать пользователя', AdminEvents.ON_BAN_USER)],
    [Markup.button.callback('Разблокировать пользователя', AdminEvents.ON_UNBAN_USER)],
    [Markup.button.callback('⬅️ Вернуться', AdminEvents.ON_OPEN_MAIN_MENU)],
])

const newsletterActionsKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Всем незарегистрированным', AdminEvents.ON_SEND_NOT_AUTH)],
    [Markup.button.callback('Всем зарегистрированным', AdminEvents.ON_SEND_AUTH)],
    [Markup.button.callback('По группам', AdminEvents.ON_SEND_GROUPS)],
    [Markup.button.callback('По ID', AdminEvents.ON_SEND_IDS)],
    [Markup.button.callback('⬅️ Вернуться', AdminEvents.ON_OPEN_MAIN_MENU)],
])

const findUserKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Найти по имени и фамилии', AdminEvents.ON_FIND_USER_BY_NAME)],
    [Markup.button.callback('Найти по логину NlogN', AdminEvents.ON_FIND_USER_BY_USERNAME)],
    [Markup.button.callback('Найти по почте', AdminEvents.ON_FIND_USER_BY_EMAIL)],
    [Markup.button.callback('⬅️ Вернуться', AdminEvents.ON_OPEN_USER_MENU)],
])

const setUserGroupConfirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', AdminEvents.ON_CONFIRM_SET_USER_GROUP)],
    [Markup.button.callback('Нет', AdminEvents.ON_NOT_CONFIRM_SET_USER_GROUP)],
])

const restartUserConfirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', AdminEvents.ON_CONFIRM_RESTART_USER)],
    [Markup.button.callback('Нет', AdminEvents.ON_NOT_CONFIRM_RESTART_USER)],
])

const banUserConfirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', AdminEvents.ON_CONFIRM_BAN_USER)],
    [Markup.button.callback('Нет', AdminEvents.ON_NOT_CONFIRM_BAN_USER)],
])

const unbanUserConfirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', AdminEvents.ON_CONFIRM_UNBAN_USER)],
    [Markup.button.callback('Нет', AdminEvents.ON_NOT_CONFIRM_UNBAN_USER)],
])

const addAdminConfirmKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Выдать права администратора', AdminEvents.ON_CONFIRM_ADD_ADMIN)],
    [Markup.button.callback('Забрать права администратора', AdminEvents.ON_CONFIRM_REMOVE_ADMIN)],
    [Markup.button.callback('Отмена', AdminEvents.ON_NOT_CONFIRM_USER_ADMIN)],
])

const createRatingTableKeyboard = (fullTableUrl: string, monthTableUrl: string) =>
    Markup.inlineKeyboard([
        [Markup.button.url('За все время', fullTableUrl)],
        [Markup.button.url('За текущий месяц', monthTableUrl)],
        [Markup.button.callback('Скачать', AdminEvents.ON_DOWNLOAD_TABLE)]
    ])

const cancelNewsletterKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Отменить', AdminEvents.ON_CANCEL_NEWSLETTER)]
])

const confirmNewsletterKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Да', AdminEvents.ON_CONFIRM_NEWSLETTER)],
    [Markup.button.callback('Отменить', AdminEvents.ON_CANCEL_NEWSLETTER)]
])



export const adminKeyboards = {
    mainActionsKeyboard,
    userActionsKeyboard,
    findUserKeyboard,
    setUserGroupConfirmKeyboard,
    restartUserConfirmKeyboard,
    banUserConfirmKeyboard,
    unbanUserConfirmKeyboard,
    addAdminConfirmKeyboard,
    createRatingTableKeyboard,
    mosActionsKeyboard,
    cancelNewsletterKeyboard,
    newsletterActionsKeyboard,
    confirmNewsletterKeyboard
}