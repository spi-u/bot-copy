import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'

export class MosCode extends Model<InferAttributes<MosCode>, InferCreationAttributes<MosCode>> {
    declare groupId: number
    declare courseId: number
    declare code: number
}

export const MOS_CODE_FIELDS = {
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
}
