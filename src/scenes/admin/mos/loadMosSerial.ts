import { SerialSceneGenerator } from "../../types"
import {bot} from "../../../start"
import xlsx from "node-xlsx"
import {find, groupBy} from "lodash"
import {MosContract, MosStatus, Student} from "../../../models"
import * as fs from 'fs'
import * as path from 'path'

const textToAccepted = 'Требуется подписание со стороны организации'

export const statusToTexts = [
    {
        text: 'Зачислен',
        code: MosStatus.ACCEPTED
    },
    {
        text: 'Договор подписан электронно',
        code: MosStatus.SIGNED
    },
    {
        text: 'Отказ в зачислении',
        code: MosStatus.REJECTED
    },
    {
        text: 'Зачислен - Отчислен',
        code: MosStatus.CANCELED
    },
    {
        text: 'Ожидание прихода Заявителя для заключения договора',
        code: MosStatus.WAITING_ARRIVAL
    },
    {
        text: 'Ожидание подписания электронного договора',
        code: MosStatus.WAITING_SIGNING
    },
    {
        text: 'Отозвано',
        code: MosStatus.REVOKED
    },
]

const startRow = 24


async function saveContracts(fileBuffer: Buffer) {
    const workSheets = xlsx.parse(fileBuffer)
    const document = workSheets[0].data
    const data = document.slice(startRow, document.length + 1)
    const groupedData = groupBy(data, (el) => el[0])

    if (Object.values(groupedData).length === 0) {
        return null
    } 
    if (Object.values(groupedData)[0][0].length !== 21) {
        return null
    }

    const results = []
    for (const [id, studentValues] of Object.entries(groupedData)) {
        const value: string[] = studentValues[0]
        const status = find(statusToTexts,
            (el) => el.text === value[12])

        results.push({
            mosId: id,
            isActive: true,
            // временная мера
            status: value[19] === textToAccepted ? MosStatus.ACCEPTED : (status ? status.code : MosStatus.ANY)
        })
    }

    return MosContract.bulkCreate(results, {updateOnDuplicate: ['status', 'studentName']})
}


const loadFileSceneGen: SerialSceneGenerator = (scene) => {
    scene.enter( async(ctx) => {
        await ctx.reply('Прикрепите реестр: ')
    })

    scene.on('document', async (ctx) => {
        const pendingMessage = await ctx.reply('Ожидайте, реестр загружается...')
        const buffer = await bot.getFileBuffer(ctx.message.document.file_id)

        const newContracts = await saveContracts(buffer)
        
        await ctx.deleteMessage(pendingMessage.message_id)

        if (newContracts === null) {
            await ctx.reply('Ошибка: выгрузка имеет неправильный формат!')
            return ctx.scene.leave()
        }
        
        await ctx.reply('Выгрузка успешно загружена!')

        const notAcceptedStudents: Student[] = []
        const acceptedStudents: Student[] = []
        for (const contract of newContracts) {
            const students = await Student.findAll({
                where: {
                    mosId: contract.mosId,
                }
            })
            if (students.length) {
                if ([MosStatus.SIGNED, MosStatus.ACCEPTED].includes(contract.status)) {
                    acceptedStudents.push(...students)
                } else {
                    notAcceptedStudents.push(...students.filter(student => !student.isMosAccepted))
                }
            }
        }
        if (!fs.existsSync('files/test')) {
            fs.mkdirSync(path.join(process.cwd(), 'files/contracts'), {recursive: true})
        }
        fs.writeFileSync(path.join(process.cwd(), `files/contracts/${Date.now()}.xlsx`), buffer)

        return ctx.replyWithHTML(
            `На текущий момент по результатам выгрузки\n\n` +
            `<b>Принято: </b> ${acceptedStudents.length}\n` +
            `<b>Не принято: </b> ${notAcceptedStudents.length}\n\n` +
            `<b>Непринятые студенты:</b>\n` +
            notAcceptedStudents.slice(0, 15).map(student => `<code>${student.firstName} ${student.lastName} (${student.id})</code>`).join('\n') +
            (notAcceptedStudents.length - 15 > 0 ? `\n<i>и еще ${notAcceptedStudents.length - 15}...</i>` : '')
        )
        ctx.scene.leave()
    })
}

export const loadMosSerial = [
    loadFileSceneGen
]