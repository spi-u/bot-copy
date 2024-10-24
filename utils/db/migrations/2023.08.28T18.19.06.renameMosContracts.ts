import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.renameTable('MosContacts', 'MosContracts')
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.renameTable('MosContracts', 'MosContacts')
}

