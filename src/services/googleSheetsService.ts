import { ConfigService } from './configService'
import { google, sheets_v4 } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth'

export class GoogleSheetsService {
    private service: sheets_v4.Sheets
    private readonly auth: GoogleAuth<JSONClient>

    constructor(configService: ConfigService) {
        this.auth = new google.auth.GoogleAuth({
            credentials: configService.get('google.credentials'),
            scopes: configService.get('google.scopes'),
        })

        this.service = google.sheets({
            version: 'v4',
            auth: this.auth,
        })
    }

    async clearTable(spreadsheetId: string, sheetId: number) {
        await this.service.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        updateCells: {
                            range: {
                                sheetId,
                            },
                            fields: '*',
                        },
                    },
                    {
                        unmergeCells: {
                            range: {
                                sheetId,
                            },
                        },
                    },
                ],
            },
        })
    }

    async updateRatingTable(
        spreadsheetId: string,
        sheetId: number,
        sheetName: string,
        values: any[][],
        requests: any[] = [],
    ) {
        // удаляем все предыдущие данные, убираем прошлое форматирование, разъединяем клетки
        await this.clearTable(spreadsheetId, sheetId)

        // добавляем данные без форматирования
        await this.service.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheetName}'`,
            requestBody: {
                values,
            },
            valueInputOption: 'RAW',
        })

        // основные запросы
        await this.service.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    // центрование всех ячеек
                    {
                        repeatCell: {
                            range: {
                                sheetId,
                            },
                            cell: {
                                userEnteredFormat: {
                                    horizontalAlignment: 'CENTER',
                                    verticalAlignment: 'MIDDLE',
                                },
                            },
                            fields: 'userEnteredFormat',
                        },
                    },
                    // закрепить header
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId,
                                gridProperties: {
                                    frozenRowCount: 2,
                                },
                            },
                            fields: 'gridProperties.frozenRowCount',
                        },
                    },
                    ...requests,
                ],
            },
        })
    }
}
