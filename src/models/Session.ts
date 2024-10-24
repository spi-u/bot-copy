import { Model, DataTypes, Optional } from 'sequelize'

interface SessionAttributes {
    id: number
    key: string
    data: string
}

type SessionCreationAttributes = Optional<SessionAttributes, 'id'>

export class Session extends Model<SessionAttributes, SessionCreationAttributes> {
    declare id: number
    declare key: string
    declare data: any
}

export const SESSION_FIELDS = {
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
}

export async function getSessionDataByKey(
    key: SessionAttributes['key'],
): Promise<SessionAttributes['data'] | null> {
    const session = await Session.findOne({
        where: {
            key,
        },
    })
    if (session) return JSON.parse(session.data)
    return null
}

export async function setSessionByKey(
    key: SessionAttributes['key'],
    data: SessionAttributes['data'],
): Promise<Session | null> {
    const session = await Session.findOne({
        where: {
            key,
        },
    })
    if (session) {
        session.data = data
        return session.save()
    }
    return null
}

export async function createSession(
    key: SessionAttributes['key'],
    data: SessionAttributes['data'],
): Promise<Session> {
    return await Session.create({
        key,
        data,
    })
}

export async function removeSessionByKey(key: SessionAttributes['key']) {
    return await Session.destroy({
        where: { key },
    })
}
