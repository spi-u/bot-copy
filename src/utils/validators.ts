export function isName(name: string): boolean {
    if (name.length >= 25) return false

    const regName = /^([а-яА-ЯЁёa-zA-Z]+)$/
    return regName.test(name)
}

export function isGrade(grade: string): boolean {
    const gradeNumber = Number(grade)
    return !!(gradeNumber &&
        Number.isInteger(gradeNumber) &&
        gradeNumber <= 14 &&
        gradeNumber > 0)
}