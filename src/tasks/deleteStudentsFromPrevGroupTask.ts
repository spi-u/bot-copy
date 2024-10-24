import { Group, Student, TgUser } from '../models'
import { bot, contestsService } from '../start'
import { Op } from 'sequelize'
import { logger } from '../services/logger'

const studentsQueue: Set<number> = new Set()
export async function deleteStudentsFromGroup() {
    if (studentsQueue.size === 0) {
        const students = await Student.findAll({
            where: {
                isPendingDeletionFromGroup: true,
            },
        })
        students.map((s) => s.id).forEach((id) => studentsQueue.add(id))
    }

    const students = await Student.findAll({
        where: {
            id: {
                [Op.in]: Array.from(studentsQueue),
            },
        },
        include: [
            {
                model: TgUser,
                as: 'user',
                attributes: ['tg_id'],
            },
        ],
    })

    for (const student of students) {
        if (student.prevGroupId && student.fromGroupDeletionTimerEnd) {
            if (student.fromGroupDeletionTimerEnd <= new Date()) {
                const prevGroup = await Group.findByPk(student.prevGroupId)
                if (!prevGroup) {
                    await student.update({
                        prevGroupId: null,
                        fromGroupDeletionTimerEnd: null,
                        isPendingDeletionFromGroup: false,
                    })

                    continue
                }

                const result = await contestsService.removeUserFromGroup(
                    prevGroup.nlognId,
                    student.nlognId,
                )

                await student.update({
                    fromGroupDeletionTimerEnd: null,
                    isPendingDeletionFromGroup: false,
                })

                if (result === null) {
                    logger.error('`Student with id=${student.id} is not a member of the group')
                }

                await bot.telegram.sendMessage(
                    student.user.tg_id,
                    bot.__('deleted_from_group', {
                        name: prevGroup.name,
                    }),
                    {
                        parse_mode: 'HTML',
                    },
                )

                logger.info(
                    `Student with id=${student.id} is deleted from nlogn group with id=${prevGroup.nlognId}`,
                )
            }
        }
    }
}
