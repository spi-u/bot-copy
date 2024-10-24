import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('TgUsers', 'phone', {
        type: DataTypes.STRING,
        defaultValue: null
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('TgUsers', 'phone')
}

