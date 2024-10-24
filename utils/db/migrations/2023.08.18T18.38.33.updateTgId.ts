import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('TgUsers', 'tg_id', {
        type: DataTypes.BIGINT
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('TgUsers', 'tg_id', {
        type: DataTypes.INTEGER
    })
}

