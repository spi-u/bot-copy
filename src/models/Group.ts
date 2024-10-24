import {
    Association,
    DataTypes,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize'
import { Student } from './Student'

export class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
    declare id: number
    declare name: string
    declare teachersInfo: string
    declare lectureNotesInfo: string
    declare chatsInfo: string
    declare info: string
    declare isSimple: boolean
    declare problemsToPass: string
    declare problemsCountToPass: number
    declare mosGroupCode: number
    declare nlognId: number
    declare cfUrl: string
    declare cfContestId: number
    declare ratingSpreadsheetsId: string
    declare monthSheetId: number
    declare isVisible: boolean
    declare indexInList: number

    declare getStudents: HasManyGetAssociationsMixin<Student>

    declare static associations: {
        students: Association<Group, Student>
    }
}

export const GROUP_FIELDS = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    info: {
        type: DataTypes.STRING,
    },
    teachersInfo: {
        type: DataTypes.STRING,
    },
    lectureNotesInfo: {
        type: DataTypes.STRING,
    },
    chatsInfo: {
        type: DataTypes.STRING,
    },
    isSimple: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    problemsToPass: {
        type: DataTypes.STRING,
        defaultValue: JSON.stringify([]),
    },
    problemsCountToPass: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
    ratingSpreadsheetsId: {
        type: DataTypes.STRING,
    },
    monthSheetId: {
        type: DataTypes.INTEGER,
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    indexInList: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}
