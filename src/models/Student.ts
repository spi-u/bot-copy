import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyAddAssociationMixin,
    HasManyGetAssociationsMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from 'sequelize'
import { TgUser } from './TgUser'
import { Group } from './Group'
import { Course } from './Course'

export class Student extends Model<InferAttributes<Student>, InferCreationAttributes<Student>> {
    declare id: CreationOptional<number>
    declare userId: ForeignKey<TgUser['id']>
    declare firstName: string
    declare lastName: string
    declare grade: string
    declare phone: string
    declare country: string
    declare city: string
    declare email: string
    declare school: string
    declare schoolCity: string
    declare nlognId: number
    declare nlognUsername: string
    declare groupId: ForeignKey<Group['id']>
    declare prevGroupId: number | null
    declare isPendingDeletionFromGroup: boolean
    declare fromGroupDeletionTimerEnd: Date | null
    declare isAuthenticated: boolean
    declare mosId: string | null
    declare isMosAccepted: boolean
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    declare group?: NonAttribute<Group>
    declare user: NonAttribute<TgUser>
    declare courses: NonAttribute<Course[]>

    declare addCourse: HasManyAddAssociationMixin<Course, number>
    declare getCourses: HasManyGetAssociationsMixin<Course>
    declare getGroup: HasOneGetAssociationMixin<Group>
}

export const STUDENT_FIELDS = {
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
    schoolCity: {
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
        defaultValue: false,
    },
    mosId: {
        type: DataTypes.STRING,
    },
    isMosAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isAuthenticated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    fromGroupDeletionTimerEnd: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}
