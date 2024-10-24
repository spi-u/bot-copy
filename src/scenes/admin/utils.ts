import moment from "moment"
import {MosContract, Student} from "../../models"
import {statusToTexts} from "./mos/loadMosSerial"


export const createStudentsInfo = async (students: Student[]): Promise<string[]> => {
    const result = []
    for (const student of students) {
        const studentInfo = await createStudentInfo(student)
        result.push(studentInfo)
    }
    return result
}


// TODO: рефракторинг
export const createStudentInfo = async (student: Student): Promise<string> => {
    const contract = student.mosId ? await MosContract.findOne({
        where: {
            mosId: student.mosId
        }
    }) : null
    const statusObj = statusToTexts.find((el) => el.code === contract?.status)
    const contractStatusText = statusObj ? statusObj.text + ` от ${moment(contract?.updatedAt).format('DD.MM.YYYY')}` : 'нет'
    const courses = await student.getCourses()
    return `<b>ID ученика:</b> ${student.id} \n` +
        `<b>Имя Фамилия:</b> ${student.firstName} ${student.lastName} \n` +
        `<b>Никнейм TG:</b> ${student.user?.tg_username ? '@' + student.user.tg_username : 'нет'} \n` +
        `<b>Телефон TG:</b> ${student.user.phone || 'нет'} \n` +
        `<b>Телефон ученика:</b> ${student.phone || 'нет'} \n` +
        `<b>Почта:</b> ${student.email || 'нет'} \n` +
        `<b>Страна:</b> ${student.country || 'нет'} \n` +
        `<b>Город:</b> ${student.city || 'нет'} \n` +
        `<b>Город (школа):</b> ${student.schoolCity || 'нет'} \n` +
        `<b>Школа:</b> ${student.school || 'нет'} \n` +
        `<b>Класс:</b> ${student.grade || 'нет'} \n` +
        `<b>Ссылка на NlogN:</b> ${student.nlognId ? `<a href="https://contest.nlogn.info/admin/users/edit/${student.nlognId}/">открыть</a>` : 'нет'} \n` +
        `<b>Логин NlogN:</b> ${student.nlognUsername || 'нет'} \n` +
        `<b>Состоит в группе:</b> ${student.group ? student.group.name : 'нет'} \n` +
        `<b>Состоит в курсах:</b> ${courses.length ? courses.map(c => c.name).join(', ') : 'нет'} \n` +
        `<b>Статус mos.ru:</b> ${contractStatusText} \n` +
        `<b>Номер mos.ru:</b> ${student.mosId || 'нет'} \n` +
        `<b>Администратор:</b> ${student.user?.is_admin ? 'да' : 'нет'} \n` +
        `<b>Заблокирован:</b> ${student.user?.is_banned ? 'да' : 'нет'} \n` +
        `<b>Зарегистрирован:</b> ${student.isAuthenticated ? 'да' : 'нет'} \n`
}
