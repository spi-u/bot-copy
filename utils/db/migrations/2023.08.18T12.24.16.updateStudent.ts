import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Students', 'isAuthenticated', {
        type: DataTypes.BOOLEAN,
    })

    await sequelize.addColumn('Students', 'mosId', {
        type: DataTypes.INTEGER,
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Students', 'isAuthenticated')
    await sequelize.removeColumn('Students', 'mosId')
}

