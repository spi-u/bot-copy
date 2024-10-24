import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.renameTable('MosCode', 'MosCodes')
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.renameTable('MosCodes', 'MosCode')
}

