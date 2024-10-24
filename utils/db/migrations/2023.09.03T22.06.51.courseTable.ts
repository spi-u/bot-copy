import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.createTable('Courses', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        indexInList: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        withRatings: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

    await sequelize.createTable('StudentToCourses', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Students',
                key: 'id'
            }
        },
        courseId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Courses',
                key: 'id'
            }
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.dropTable('Courses')
    await sequelize.dropTable('StudentToCourses')
}

