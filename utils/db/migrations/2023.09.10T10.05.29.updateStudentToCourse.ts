import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.renameColumn('StudentToCourses', 'courseId', 'CourseId')
    await sequelize.renameColumn('StudentToCourses', 'studentId', 'StudentId')

}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.renameColumn('StudentToCourses', 'CourseId', 'courseId')
    await sequelize.renameColumn('StudentToCourses', 'StudentId', 'studentId')
}

