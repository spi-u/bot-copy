import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('MosContracts', 'mosContractId', {
        type: DataTypes.STRING
    })

    await sequelize.changeColumn('MosContracts', 'mosId', {
        type: DataTypes.STRING
    })

    await sequelize.changeColumn('Students', 'mosId', {
        type: DataTypes.STRING
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.changeColumn('MosContracts', 'mosContractId', {
        type: DataTypes.INTEGER
    })

    await sequelize.changeColumn('MosContracts', 'mosId', {
        type: DataTypes.INTEGER
    })

    await sequelize.changeColumn('Students', 'mosId', {
        type: DataTypes.INTEGER
    })
}

