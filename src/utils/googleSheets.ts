export function getRgb(red: number, green: number, blue: number) {
    return {
        red: red / 255,
        green: green / 255,
        blue: blue / 255,
    }
}

export function getSheetUrl(spreadsheetsId: string, sheetId = 0) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetsId}/edit#gid=${sheetId}`
}
