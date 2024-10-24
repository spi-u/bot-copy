import Scene from "../scene"
import {SceneView} from "../types"
import {BotContextMessageUpdate} from "../../types"
import {BaseScene} from "telegraf/typings/scenes"
import {Group} from "../../models"
import {groupKeyboards} from "../../keyboards/groupKeyboard"
import {contestsService} from "../../start"
import {AdminEvents, adminKeyboards} from "../../keyboards/adminKeyboard"
import {getSheetUrl} from "../../utils/googleSheets"
import xlsx from "node-xlsx";
import moment from "moment";

interface SceneState {
    selectedGroupId: number
}

export const createRatingTableBuffer = (tableData: (string|number)[][]): Buffer =>  {

    // const range = {s: {c: 0, r: 0}, e: {c: 1, r: 0}}
    // const contestsHeaderRanges = []
    //
    // for (let i = 2; i <= tableData[0].length - 4; i+=2) {
    //     contestsHeaderRanges.push({
    //         s: {c: i, r: 0},
    //         e: {c: i + 1, r: 0}
    //     })
    // }
    // const ranges = [
    //     {s: {c: 0, r: 0}, e: {c: 0, r: 1}},
    //     {s: {c: 1, r: 0}, e: {c: 1, r: 1}},
    //     {s: {c: tableData[0].length-3, r: 0}, e: {c: tableData[0].length-1, r: 0}},
    //     ...contestsHeaderRanges
    // ]
    // const sheetOptions = {
    //     '!merges': ranges,
    //     '!cols': [
    //         {wch: 10},
    //         {wch: 25},
    //     ]
    // }
    return xlsx.build([
        {
            name: 'Рейтинговая таблица',
            data: tableData,
            options: {}
        }])

}


export class GetTableScene extends Scene<BotContextMessageUpdate<SceneState>> implements SceneView {
    create(): BaseScene<BotContextMessageUpdate> {
        this.scene.enter(async (ctx) => {
            const groups = await Group.findAll({
                where: {
                    isVisible: true
                }
            })
            await ctx.replyWithHTML(
                'Выберите группу: ',
                groupKeyboards.createListKeyboard(groups))
        })

        this.scene.action(/ON_GROUP_SELECT_(.*)/i, async (ctx) => {
            await ctx.deleteMessage()

            const group = await Group.findByPk(ctx.match[1])
            if (!group) {
                throw new Error('Group is not found')
            }

            ctx.scene.session.state.selectedGroupId = group.id

            const contestsIds = await contestsService.getGroupContestsIds(group.nlognId)
            if (!contestsIds) {
                return ctx.replyWithHTML('В группе еще не проводились контесты.')
            }

            if (!group.ratingSpreadsheetsId || !group.monthSheetId) {
                throw new Error(`Rating table id is not found for group id=${group.id}`)
            }

            return ctx.replyWithHTML(
                `Выберите опцию:`,
                adminKeyboards.createRatingTableKeyboard(
                    getSheetUrl(group.ratingSpreadsheetsId),
                    getSheetUrl(group.ratingSpreadsheetsId, group.monthSheetId),
                )
            )
        })

        this.scene.action(AdminEvents.ON_DOWNLOAD_TABLE, async (ctx) => {
            const group = await Group.findByPk(ctx.scene.session.state.selectedGroupId)
            if (!group) {
                throw new Error('Group is not found')
            }

            const contestsIds = await contestsService.getGroupContestsIds(group.nlognId)
            if (!contestsIds) {
                return ctx.reply('В группе еще не проводились контесты')
            }

            const tableData = await contestsService.getRatingTableData(contestsIds)
            const table = await contestsService.createFullRatingTable(tableData, true)
            const buffer = createRatingTableBuffer(table)

            return ctx.replyWithDocument({
                source: buffer,
                filename: `Рейтинговая таблица ${group.name} ${moment().format('DD-MM-YYYY')}.xlsx`
            })
        })


        return this.scene
    }
}