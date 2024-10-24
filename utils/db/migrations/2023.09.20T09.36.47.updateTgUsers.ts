import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('TgUsers', 'is_banned', {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('TgUsers', 'is_banned')
}

