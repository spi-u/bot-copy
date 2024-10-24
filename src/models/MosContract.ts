import {
    Model,
    DataTypes,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize'

export enum MosStatus {
    ACCEPTED, // Зачислен
    SIGNED, // Договор подписан электронно
    REJECTED, // Отказ в зачислении
    CANCELED, // Зачислен - Отчислен
    WAITING_ARRIVAL, // Ожидание прихода Заявителя для заключения договора
    WAITING_SIGNING, // Ожидание подписания электронного договора
    REVOKED, // Отозвано
    ANY, // Другое
}

export class MosContract extends Model<
    InferAttributes<MosContract>,
    InferCreationAttributes<MosContract>
> {
    declare id: CreationOptional<number>
    declare mosId: string
    declare mosContractId: CreationOptional<string>
    declare studentName: CreationOptional<string>
    declare isActive: boolean
    declare status: MosStatus
    declare groupCode: CreationOptional<number>
    declare updatedAt: CreationOptional<Date>
    declare createdAt: CreationOptional<Date>
}

export const MOS_CONTRACT_FIELDS = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    mosId: {
        type: DataTypes.STRING,
        unique: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    mosContractId: {
        type: DataTypes.STRING,
    },
    studentName: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.INTEGER,
    },
    groupCode: {
        type: DataTypes.INTEGER,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}
