import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
    declare id: number
    declare name: string
    declare indexInList: number
    declare isDefault: boolean
    declare withRatings: boolean
    declare isVisible: boolean
    declare info: string
    declare teachersInfo: string
    declare lectureNotesInfo: string
    declare chatsInfo: string
}

export const COURSE_FIELDS = {
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
        defaultValue: 0,
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    withRatings: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
}
