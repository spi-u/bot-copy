import moment from 'moment/moment'
import { Group } from '../models'
import { contestsService, googleSheetsService } from '../start'
import { getRgb } from '../utils'
import { GetFullTableResponseData } from '../services'

const defaultSheetId = 0
const startColumnDataIndex = 2
const startRowDataIndex = 2

function createRequests(sheetId: number, tableData: GetFullTableResponseData) {
    const requests = []

    let currentColumn = startColumnDataIndex,
        currentRow = startRowDataIndex
    for (const contestData of tableData.header) {
        const problemsCount = contestData.problems.length
        requests.push({
            mergeCells: {
                range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: currentColumn,
                    endColumnIndex: currentColumn + problemsCount + 1,
                },
                mergeType: 'MERGE_ALL',
            },
        })
        requests.push({
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: currentColumn,
                    endColumnIndex: currentColumn + 1,
                },
                cell: {
                    userEnteredValue: {
                        formulaValue: `=HYPERLINK("https://contest.nlogn.info/contest/${contestData.contestId}"; "#${contestData.contestName}")`,
                    },
                    userEnteredFormat: {
                        horizontalAlignment: 'CENTER',
                        verticalAlignment: 'MIDDLE',
                    },
                },
                fields: '*',
            },
        })

        currentColumn += problemsCount + 1
    }

    // выставляем ширину и высоту результатов по задачам
    requests.push({
        updateDimensionProperties: {
            range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: startColumnDataIndex,
                endIndex: currentColumn,
            },
            properties: {
                pixelSize: 40,
            },
            fields: 'pixelSize',
        },
    })

    requests.push({
        updateDimensionProperties: {
            range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: startRowDataIndex,
                endIndex: startColumnDataIndex + tableData.rows.length,
            },
            properties: {
                pixelSize: 40,
            },
            fields: 'pixelSize',
        },
    })

    // выставляем цвета результатов по задачам
    for (const userData of tableData.rows) {
        currentColumn = 2
        for (const userContestData of userData.row) {
            for (const userCellData of userContestData.cells) {
                const backgroundColor = userCellData.isSolved
                    ? getRgb(144, 238, 144)
                    : getRgb(199, 195, 195)
                if (userCellData.retriesNumber) {
                    requests.push({
                        repeatCell: {
                            range: {
                                sheetId,
                                startRowIndex: currentRow,
                                endRowIndex: currentRow + 1,
                                startColumnIndex: currentColumn,
                                endColumnIndex: currentColumn + 1,
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor,
                                    horizontalAlignment: 'CENTER',
                                    verticalAlignment: 'MIDDLE',
                                },
                            },
                            fields: 'userEnteredFormat',
                        },
                    })
                }
                currentColumn += 1
            }

            // цвета суммы результатов по контесту
            // const backgroundColor = userContestData.score >= userContestData.cells.length / 2
            //     ? getRgb(144, 238, 144)
            //     : getRgb(255, 114, 118)
            requests.push({
                repeatCell: {
                    range: {
                        sheetId,
                        startRowIndex: currentRow,
                        endRowIndex: currentRow + 1,
                        startColumnIndex: currentColumn,
                        endColumnIndex: currentColumn + 1,
                    },
                    cell: {
                        userEnteredFormat: {
                            // backgroundColor,
                            horizontalAlignment: 'CENTER',
                            verticalAlignment: 'MIDDLE',
                        },
                    },
                    fields: 'userEnteredFormat',
                },
            })
            currentColumn += 1
        }
        currentRow += 1
    }

    return requests
}

async function updateTable(
    tableData: GetFullTableResponseData,
    spreadsheetsId: string,
    sheetId: number,
    sheetName: string,
) {
    const table = await contestsService.createFullRatingTable(tableData)

    const requests = createRequests(sheetId, tableData)

    await googleSheetsService.updateRatingTable(spreadsheetsId, sheetId, sheetName, table, requests)
}

export async function ratingTablesUpdate() {
    const groups = await Group.findAll({
        where: {
            isVisible: true,
        },
    })

    for (const group of groups) {
        if (group.ratingSpreadsheetsId && group.monthSheetId) {
            const spreadsheetsId = group.ratingSpreadsheetsId
            const monthSheetId = group.monthSheetId

            const contestsIds = await contestsService.getGroupContestsIds(group.nlognId)
            if (!contestsIds) {
                continue
            }

            // обновляем за все время
            const tableData = await contestsService.getRatingTableData(contestsIds)
            await updateTable(tableData, spreadsheetsId, defaultSheetId, 'За все время')

            // обновляем за текущий месяц
            const timeIntervalInMs =
                Date.now() - new Date(moment().year(), moment().month(), 1).getTime()
            const monthTableData = await contestsService.getRatingTableData(
                contestsIds,
                timeIntervalInMs,
            )
            await updateTable(monthTableData, spreadsheetsId, monthSheetId, 'За месяц')

            // logger.info(`Tables for group ${group.name} updated`)
        }
    }
}
