import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('MosContracts', 'mosId', {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('MosContracts', 'mosId', {
        type: DataTypes.STRING,
        unique: false,
    })
}

