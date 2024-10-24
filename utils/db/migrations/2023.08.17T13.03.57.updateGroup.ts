import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('Groups', 'ratingSpreadsheetsId', {
        type: DataTypes.STRING,
        allowNull: true,
    })

    await sequelize.addColumn('Groups', 'monthSheetId', {
        type: DataTypes.INTEGER,
        allowNull: true,
    })

}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('Groups', 'ratingSpreadsheetsId')
    await sequelize.removeColumn('Groups', 'monthSheetId')
}

