import {DataTypes} from "sequelize"
import {Migration} from "../umzug"


export const up: Migration = async ({context: sequelize}) => {
    await sequelize.createTable('TgUsers', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tg_id: {
            type: DataTypes.INTEGER,
            unique: true,
        },
        tg_username: {
            type: DataTypes.STRING,
        },
        tg_first_name: {
            type: DataTypes.STRING,
        },
        tg_last_name: {
            type: DataTypes.STRING,
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

    await sequelize.createTable('Students', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        grade: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.STRING,
        },
        school: {
            type: DataTypes.STRING,
        },
        nlognId: {
            type: DataTypes.INTEGER,
        },
        nlognUsername: {
            type: DataTypes.STRING,
        },
        prevGroupId: {
            type: DataTypes.INTEGER,
        },
        isPendingDeletionFromGroup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fromGroupDeletionTimerEnd: DataTypes.DATE,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })


    await sequelize.createTable('Sessions', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
        },
        data: {
            type: DataTypes.JSON,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

    await sequelize.createTable('Groups', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        teachersInfo: {
            type: DataTypes.STRING,
        },
        lectureNotesInfo: {
            type: DataTypes.STRING,
        },
        isSimple: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        problemsToPass: {
            type: DataTypes.STRING,
            defaultValue: null,
            allowNull: true
        },
        problemsCountToPass: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        mosGroupCode: {
            type: DataTypes.INTEGER,
        },
        nlognId: {
            type: DataTypes.INTEGER,
        },
        cfUrl: {
            type: DataTypes.STRING,
        },
        cfContestId: {
            type: DataTypes.INTEGER,
        },
        isVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

    await sequelize.createTable('MosContacts', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mosId: {
            type: DataTypes.INTEGER,
        },
        studentName: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.INTEGER
        },
        groupCode: {
            type: DataTypes.INTEGER
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })

    await sequelize.createTable('CfAccounts', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        handle: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    })


    await sequelize.addColumn('Students', 'userId', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'TgUsers', key: 'id' },
    })

    await sequelize.addColumn('Students', 'groupId', {
        type: DataTypes.INTEGER,
        references: { model: 'Groups', key: 'id' },
    })
}


export const down: Migration = async ({context: sequelize}) => {
    await sequelize.dropTable('TgUsers')
    await sequelize.dropTable('Students')
    await sequelize.dropTable('Sessions')
    await sequelize.dropTable('MosContracts')
    await sequelize.dropTable('TgUsers')
    await sequelize.dropTable('Groups')
}

