import { ScenesId } from './types'
import { SerialSceneGenerator } from './types'
import { Group } from '../models'
import { cfService } from '../start'
import { includes, isEmpty } from 'lodash'
import { CfAccount } from '../models'
import { CfEvents, cfKeyboards } from '../keyboards/cfKeyboard'
import fs from 'fs'
import path from 'path'
import { logger } from '../services'
import { getLog } from '../utils'

const additionalCountToPass = 2

export interface CfSceneState {
    solvedProblems: string[]
}

enum CfSerialSteps {
    INFO,
    CHECK,
    SELECT_GROUP,
}

export async function getStudentPossibleGroups(studentSolvedProblems: string[]): Promise<Group[]> {
    const groups = await Group.findAll({
        where: {
            isVisible: true,
            isSimple: false,
        },
        order: ['indexInList'],
    })

    const resultGroups: Group[] = []
    const additionalProblemsToPass: string[] = []
    for (const group of groups.reverse()) {
        const problemsToPass = JSON.parse(group.problemsToPass)

        const problemsCountToPass = group.problemsCountToPass
        const studentResultsToPass = studentSolvedProblems.filter((problemIndex) =>
            includes(problemsToPass, problemIndex),
        )

        const studentAdditionalResultToPass = studentSolvedProblems.filter((problemIndex) =>
            includes(additionalProblemsToPass, problemIndex),
        )

        if (
            studentResultsToPass.length >= problemsCountToPass ||
            studentAdditionalResultToPass.length >= additionalCountToPass
        )
            resultGroups.push(group)

        additionalProblemsToPass.push(...problemsToPass)
    }

    return resultGroups.reverse()
}

const contestInfoSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        const selectedGroup = await Group.findByPk(ctx.session.state.user.selectedGroupId)
        if (!selectedGroup) {
            throw new Error('Group is not found')
        }

        const freeAccounts = await CfAccount.findAll({
            where: {
                isActive: true,
            },
        })
        if (!freeAccounts.length) {
            return ctx.replyWithHTML(
                ctx.i18n.__('cf_scene.no_free_accounts'),
                cfKeyboards.reloadSceneKeyboard,
            )
        }

        const account = freeAccounts[0]
        await account.update({ isActive: false })

        ctx.session.state.user.cfHandle = account.handle

        logger.info(getLog(ctx, `get cf account ${account.handle}/${account.password}`))
        const groups = await Group.findAll({
            where: {
                isVisible: true,
            },
            order: ['indexInList'],
        })
        await ctx.replyWithHTML(
            ctx.i18n.__('cf_scene.info') +
                '\n' +
                groups
                    .map((group, index) => {
                        if (group.isSimple) {
                            return `${index + 1}) ${ctx.i18n.__('cf_scene.info_simple_group', {
                                name: group.name,
                            })}`
                        }
                        return `${index + 1}) ${ctx.i18n.__('cf_scene.info_group', {
                            name: group.name,
                            problems: JSON.parse(group.problemsToPass).join(', '),
                            count: group.problemsCountToPass.toString(),
                        })}`
                    })
                    .join('') +
                '\n' +
                ctx.i18n.__('cf_scene.info_account', {
                    handle: account.handle,
                    password: account.password,
                }),
            cfKeyboards.createContestUrlKeyboard(selectedGroup.cfUrl),
        )
        await ctx.replyWithAnimation({
            source: fs.readFileSync(path.join(process.cwd(), 'files/cf_example.gif')),
            filename: 'example.gif',
        })

        return ctx.serial.next()
    })

    scene.action(CfEvents.ON_RELOAD_SCENE, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.reenter()
    })
}

const contestCheckSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter(async (ctx) => {
        return ctx.replyWithHTML(
            ctx.i18n.__('cf_scene.check_info'),
            cfKeyboards.contestCheckKeyboard,
        )
    })

    scene.action(CfEvents.ON_CONTEST_CHECK, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.replyWithHTML(
            ctx.i18n.__('cf_scene.confirm_check'),
            cfKeyboards.confirmContestCheckKeyboard,
        )
    })

    scene.action(CfEvents.ON_NOT_CONFIRMED_CONTEST_CHECK, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        return ctx.scene.reenter()
    })

    scene.action(CfEvents.ON_CONFIRMED_CONTEST_CHECK, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()

        const selectedGroup = await Group.findByPk(ctx.session.state.user.selectedGroupId)
        if (!selectedGroup) {
            throw new Error('Group is not found')
        }
        // сейчас cfContestId ставится как правило одинаковым для всех активных групп
        const studentResults = await cfService.getStudentResultsWithSolvedProblem(
            selectedGroup.cfContestId,
            ctx.session.state.user.cfHandle,
        )

        logger.info(
            getLog(
                ctx,
                `check contest result ${studentResults.map((result) => result.problem.index).join(', ')}`,
            ),
        )
        await ctx.replyWithHTML(
            !isEmpty(studentResults)
                ? ctx.i18n.__('cf_scene.result_problems.solved', {
                      problems: studentResults
                          .map((result) => `${result.problem.index}. ${result.problem.name}`)
                          .join('\n'),
                  })
                : ctx.i18n.__('cf_scene.result_problems.not_solved'),
        )

        return ctx.serial.next<CfSceneState>(CfSerialSteps.SELECT_GROUP, {
            solvedProblems: studentResults.map((result) => result.problem.index),
        })
    })
}

const selectGroupSceneGen: SerialSceneGenerator<CfSceneState> = (scene) => {
    scene.enter(async (ctx) => {
        const studentResultGroups = await getStudentPossibleGroups(
            ctx.scene.session.state.solvedProblems,
        )
        if (studentResultGroups.length) {
            const resultGroup = studentResultGroups[studentResultGroups.length - 1]

            await ctx.student.update({
                groupId: resultGroup.id,
            })
            await ctx.replyWithHTML(
                ctx.i18n.__('cf_scene.confirmed_group_info', {
                    name: resultGroup.name,
                }),
            )

            return ctx.scene.enter(ScenesId.COURSE_SCENE)
        }

        const simpleGroups = await Group.findAll({
            where: {
                isSimple: true,
                isVisible: true,
            },
        })

        return ctx.replyWithHTML(
            ctx.i18n.__('cf_scene.confirmed_group_select_info'),
            cfKeyboards.createGroupsListKeyboard(simpleGroups),
        )
    })

    scene.action(/ON_GROUP_CONFIRM_(.*)/i, async (ctx) => {
        await ctx.deleteMessageOrClearReplyMarkup()
        const group = await Group.findByPk(ctx.match[1])
        if (!group) {
            throw new Error('Group is not found')
        }

        logger.info(getLog(ctx, `group ${group.name} confirmed`))

        await ctx.student.update({
            groupId: group.id,
        })

        await ctx.replyWithHTML(
            ctx.i18n.__('cf_scene.confirmed_group_info', {
                name: group.name,
            }),
        )
        return ctx.scene.enter(ScenesId.COURSE_SCENE)
    })
}

export const cfSerial = [contestInfoSceneGen, contestCheckSceneGen, selectGroupSceneGen]
