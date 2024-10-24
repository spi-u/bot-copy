import { middlewareFn } from './types'
import { BotContext } from '../types'
import { createUser, findUserByTgId, Group } from '../models'
import { initialBotState } from '../state'
import { logger } from '../services'

export function authMiddleware(): middlewareFn<BotContext> {
    return async function (ctx, next) {
        if (!ctx.from || !ctx.chat || ctx.chat.type !== 'private') {
            logger.error('context is incorrect')
            return
        }

        let user = await findUserByTgId(ctx.from.id)
        if (!user) {
            user = await createUser({
                tg_id: ctx.from.id,
                tg_username: ctx.from.username,
                tg_first_name: ctx.from.first_name,
                tg_last_name: ctx.from.last_name,
                // is_admin: true,
            })
            await user.createStudent()
            ctx.session.state = initialBotState
        } else {
            await user.update({
                tg_username: ctx.from.username,
                tg_first_name: ctx.from.first_name,
                tg_last_name: ctx.from.last_name,
            })
        }

        if (user.is_banned) {
            return
        }
        ctx.session.state.user.id = user.id

        ctx.tgUser = user
        ctx.student = await user.getStudent({
            include: {
                model: Group,
                as: 'group',
            },
        })

        // if (!user.is_admin) {
        //     return ctx.replyWithHTML('⚠️ На данный момент набор на кружки <b>закрыт</b>, поэтому доступ к занятиям получить не получится. Но уже в сентябре откроется регистрация! Следи за информацией в нашем телеграм канале @nlogninfo')
        // }
        return next()
    }
}
