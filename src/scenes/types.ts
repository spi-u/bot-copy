import { BaseScene } from 'telegraf/typings/scenes'
import { BotContextMessageUpdate } from '../types'

export enum ScenesId {
    USER_INFO_SCENE = 'USER_INFO_SCENE',
    GROUP_SCENE = 'GROUP_SCENE',
    TEST_SCENE = 'TEST_SCENE',
    MOS_SCENE = 'MOS_SCENE',
    CF_SCENE = 'CF_SCENE',
    CONTEST_SCENE = 'CONTEST_SCENE',
    COURSE_SCENE = 'COURSE_SCENE',
    END_SCENE = 'END_SCENE',

    ADMIN_MOS_SCENE = 'ADMIN_MOS_SCENE',
    ADMIN_MOS_ADD_CONTRACT_SCENE = 'ADMIN_MOS_ADD_CONTRACT_SCENE',
    ADMIN_CF_ACCOUNTS_SCENE = 'ADMIN_CF_ACCOUNTS_SCENE',
    ADMIN_FIND_USER_BY_NAME_SCENE = 'ADMIN_FIND_USER_BY_NAME_SCENE',
    ADMIN_FIND_USER_BY_USERNAME_SCENE = 'ADMIN_FIND_USER_BY_USERNAME_SCENE',
    ADMIN_FIND_USER_BY_EMAIL_SCENE = 'ADMIN_FIND_USER_BY_EMAIL_SCENE',
    ADMIN_SET_USER_GROUP_SCENE = 'ADMIN_SET_USER_GROUP_SCENE',
    ADMIN_SET_USERS_GROUPS_SCENE = 'ADMIN_SET_USERS_GROUPS_SCENE',
    ADMIN_GET_TABLE_SCENE = 'ADMIN_GET_TABLE_SCENE',
    ADMIN_USER_ADMIN = 'ADMIN_USER_ADMIN',
    ADMIN_RESTART_USER = 'ADMIN_RESTART_USER',
    ADMIN_BAN_USER = 'ADMIN_BAN_USER',
    ADMIN_UNBAN_USER = 'ADMIN_UNBAN_USER',
    ADMIN_NEWSLETTER = 'ADMIN_NEWSLETTER'
}

export interface SceneView {
    create(): BaseScene<BotContextMessageUpdate>

    validate?(input: string): boolean
}

export interface SerialView {
    next(): void

    next(index: number): void

    next<D extends object = any>(index: number, initialState: D): void

    restart(): void

    getCurrentIndex(): number
}

export type SerialSceneGenerator<D extends object = any> = (scene: BaseScene<BotContextMessageUpdate<D>>) => void