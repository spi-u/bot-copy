import {
    CreationAttributes,
    CreationOptional,
    DataTypes,
    HasOneCreateAssociationMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from 'sequelize'
import { Student } from './Student'

type TgUserCreationAttr = CreationAttributes<TgUser>

export class TgUser extends Model<InferAttributes<TgUser>, InferCreationAttributes<TgUser>> {
    declare id: CreationOptional<number>
    declare tg_id: number
    declare tg_username: string | null
    declare phone: string | null
    declare tg_first_name: string | null
    declare tg_last_name: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
    declare is_admin: CreationOptional<boolean>
    declare is_banned: CreationOptional<boolean>

    declare createStudent: HasOneCreateAssociationMixin<Student>
    declare getStudent: HasOneGetAssociationMixin<Student>
}

export const TG_USER_FIELDS = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tg_id: {
        type: DataTypes.BIGINT,
        unique: true,
    },
    tg_username: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
        defaultValue: null,
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
    is_banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}

export async function createUser(attr: TgUserCreationAttr): Promise<TgUser> {
    return await TgUser.create(attr)
}

export async function findUserByTgId(tg_id: number): Promise<TgUser | null> {
    return await TgUser.findOne({
        where: {
            tg_id,
        },
    })
}
