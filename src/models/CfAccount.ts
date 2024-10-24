import { Model, DataTypes, Optional } from 'sequelize'

interface CfAccountAttributes {
    id: number
    handle: string
    password: string
    isActive: boolean
}

export type CfAccountCreationAttributes = Optional<CfAccountAttributes, 'id'>

export class CfAccount extends Model<CfAccountAttributes, CfAccountCreationAttributes> {
    declare id: number
    declare handle: string
    declare password: string
    declare isActive: boolean
}

export const CF_ACCOUNT_FIELDS = {
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
        defaultValue: true,
    },
}
