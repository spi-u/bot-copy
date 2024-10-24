import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Courses', 'info', {
        type: DataTypes.STRING,
        allowNull: true
    })
    await sequelize.addColumn('Groups', 'info', {
        type: DataTypes.STRING,
        allowNull: true
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Courses', 'info')
    await sequelize.removeColumn('Groups', 'info')
}