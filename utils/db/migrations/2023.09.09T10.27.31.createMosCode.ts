import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.createTable('MosCode', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        groupId: {
            type: DataTypes.INTEGER,
        },
        courseId: {
            type: DataTypes.INTEGER,
        },
        code: {
            type: DataTypes.INTEGER,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.dropTable('MosCode')
}

