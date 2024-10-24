import * as log4js from 'log4js'

log4js.configure({
    appenders: { bot: { type: 'console' } },
    categories: { default: { appenders: ['bot'], level: 'info' } },
})

export const logger = log4js.getLogger('bot')
