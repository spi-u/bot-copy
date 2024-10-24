import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Courses', 'chatsInfo', {
        type: DataTypes.STRING,
    })

    await sequelize.addColumn('Courses', 'lectureNotesInfo', {
        type: DataTypes.STRING,
    })

    await sequelize.addColumn('Courses', 'teachersInfo', {
        type: DataTypes.STRING,
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Courses', 'chatsInfo')
    await sequelize.removeColumn('Courses', 'lectureNotesInfo')
    await sequelize.removeColumn('Courses', 'teachersInfo')
}