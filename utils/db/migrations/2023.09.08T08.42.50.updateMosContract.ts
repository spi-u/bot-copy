import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.addColumn('MosContracts', 'mosContractId', {
        type: DataTypes.INTEGER,
        allowNull: true
    })

    await sequelize.addColumn('MosContracts', 'isActive', {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    })

    await sequelize.addColumn('Students', 'isMosAccepted', {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.removeColumn('MosContracts', 'mosContractId')
    await sequelize.removeColumn('MosContracts', 'isActive')
    await sequelize.removeColumn('Students', 'isMosAccepted')
}

