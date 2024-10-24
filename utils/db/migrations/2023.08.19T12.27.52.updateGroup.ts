import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Groups', 'indexInList', {
        type: DataTypes.INTEGER,
        defaultValue: 0
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Groups', 'indexInList')
}

