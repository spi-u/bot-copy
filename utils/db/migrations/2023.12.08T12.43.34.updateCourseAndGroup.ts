import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('Courses', 'info', {
        type: DataTypes.TEXT,
        allowNull: true
    })
    await sequelize.changeColumn('Groups', 'info', {
        type: DataTypes.TEXT,
        allowNull: true
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Courses', 'info')
    await sequelize.removeColumn('Groups', 'info')
}