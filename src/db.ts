import { Sequelize } from 'sequelize'
import {
    Group,
    GROUP_FIELDS,
    Session,
    SESSION_FIELDS,
    TG_USER_FIELDS,
    TgUser,
    Student,
    STUDENT_FIELDS,
    MosContract,
    MOS_CONTRACT_FIELDS,
} from './models'
import { loadFile } from 'sequelize-fixtures'
import { CF_ACCOUNT_FIELDS, CfAccount } from './models'
import { ConfigService } from './services'
import { Course, COURSE_FIELDS } from './models/Course'
import { STUDENT_TO_COURSE_FIELDS, StudentToCourse } from './models'
import { MOS_CODE_FIELDS, MosCode } from './models'
import { logger } from './services'

let db: Sequelize

const configService = new ConfigService()

switch (process.env.NODE_ENV) {
    case 'development':
        db = new Sequelize({
            dialect: 'postgres',
            username: configService.get('postgres.user'),
            password: configService.get('postgres.password'),
            host: configService.get('postgres.host'),
            port: configService.get('postgres.port'),
            logging: false,
        })
        break
    case 'production':
        db = new Sequelize(
            `postgres://${configService.get('postgres.user')}:${configService.get('postgres.password')}@${configService.get('postgres.host')}:${configService.get('postgres.port')}/${configService.get('postgres.db')}`,
            {
                logging: false,
            },
        )
        break
    default:
        console.error(`No database found for environment "${process.env.NODE_ENV}"`)
        process.exit(1)
}

TgUser.init(TG_USER_FIELDS, { sequelize: db })
Session.init(SESSION_FIELDS, { sequelize: db })
Group.init(GROUP_FIELDS, { sequelize: db })
Student.init(STUDENT_FIELDS, { sequelize: db })
MosContract.init(MOS_CONTRACT_FIELDS, { sequelize: db })
CfAccount.init(CF_ACCOUNT_FIELDS, { sequelize: db })
Course.init(COURSE_FIELDS, { sequelize: db })
StudentToCourse.init(STUDENT_TO_COURSE_FIELDS, { sequelize: db })
MosCode.init(MOS_CODE_FIELDS, { sequelize: db })

TgUser.hasOne(Student, {
    foreignKey: 'userId',
    as: 'student',
})
Student.belongsTo(TgUser, {
    as: 'user',
})

Group.hasMany(Student, {
    foreignKey: 'groupId',
    sourceKey: 'id',
    as: 'students',
})
Student.belongsTo(Group, {
    foreignKey: 'groupId',
    targetKey: 'id',
    as: 'group',
})

Course.belongsToMany(Student, { through: StudentToCourse })
Student.belongsToMany(Course, { through: StudentToCourse })

export const startDB = async () => {
    if (process.env.NODE_ENV === 'development') {
        await db.sync({
            force: true,
        })
        await loadFile('fixtures/dev.json', db.models)
    }

    try {
        await db.authenticate()
        logger.log('Connection has been established successfully.')
    } catch (error) {
        logger.error('Unable to connect to the database:', error)
    }
}

export default db
