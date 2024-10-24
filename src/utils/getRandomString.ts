const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function getRandomString(length: number) {
    if ((length == undefined) || (length <= 0)) {
        length = 1
    }
    let result = ''
    let iffirst = 0
    for (let i = 0; i < length; i++) {
        if (i == 0) {
            iffirst = 10
        } else {
            iffirst = 0
        }
        result += characters[Math.round(Math.random() * (characters.length - iffirst - 1))]
    }

    return result
}
