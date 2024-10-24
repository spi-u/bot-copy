import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Groups', 'chatsInfo', {
        type: DataTypes.STRING,
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Groups', 'chatsInfo')
}