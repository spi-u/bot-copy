import fs from 'fs'
import path from 'path'
import { BotContextMessageUpdate } from '../types'
import { ScenesId, SceneView } from './types'
import { BaseScene } from 'telegraf/typings/scenes'
import Scene from './scene'
import { Group } from '../models'
import { GroupEvents, groupKeyboards } from '../keyboards/groupKeyboard'
import { logger } from '../services'
import { getLog } from '../utils'

export class GroupScene extends Scene implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            const groups = await Group.findAll({
                where: {
                    isVisible: true,
                },
                order: ['indexInList'],
            })
            await ctx.replyWithPhoto({
                source: fs.readFileSync(path.join(process.cwd(), 'files/groups_info_2024.jpg')),
                filename: 'groups_info.jpg',
            })
            return ctx.replyWithHTML(
                ctx.i18n.__('group_scene.select'),
                groupKeyboards.createListKeyboard(groups),
            )
        })

        this.scene.action(/ON_GROUP_SELECT_(.*)/i, async (ctx) => {
            const group = await Group.findByPk(ctx.match[1])
            if (!group) {
                logger.error(getLog(ctx, `group with id=${ctx.match[1]} not found`))
                return ctx.scene.reenter()
            }

            logger.info(getLog(ctx, `group ${group.name} selected`))

            await ctx.editMessageReplyMarkup(undefined)
            await ctx.replyWithHTML(ctx.i18n.__('group_scene.selected_group', { name: group.name }))
            ctx.session.state.user.selectedGroupId = group.id

            if (group.isSimple) {
                ctx.session.state.user.confirmedGroupId = group.id

                return ctx.replyWithHTML(
                    ctx.i18n.__('group_scene.confirm_simple_group'),
                    groupKeyboards.confirmSimpleGroupKeyboard,
                )
            } else {
                return ctx.scene.enter(ScenesId.CF_SCENE)
            }
        })

        this.scene.action(GroupEvents.ON_CONFIRM_SIMPLE_GROUP, async (ctx) => {
            await ctx.deleteMessageOrClearReplyMarkup()
            await ctx.student.update({
                groupId: ctx.session.state.user.selectedGroupId,
            })
            return ctx.scene.enter(ScenesId.COURSE_SCENE)
        })

        this.scene.action(GroupEvents.ON_NOT_CONFIRM_SIMPLE_GROUP, async (ctx) => {
            await ctx.deleteMessageOrClearReplyMarkup()
            return ctx.scene.reenter()
        })

        return this.scene
    }
}
