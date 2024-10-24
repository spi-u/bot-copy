import { ScenesId } from './types'
import { GroupScene } from './groupScene'
import { TestScene } from './testScene'
import { BaseScene } from 'telegraf/typings/scenes'
import { BotContextMessageUpdate } from '../types'
import { createSerialScenes } from './scene'
import { userInfoSerial } from './userInfoSerial'
import { contestsSerial } from './contestsSerial'
import { loadMosSerial } from './admin/mos/loadMosSerial'
import { LoadCfAccountsScene } from './admin/loadCfAccountsScene'
import { mosSerial } from './mosSerial'
import { FindUserByNameScene } from './admin/users/findUserByNameScene'
import { FindUserByUsernameScene } from './admin/users/findUserByUsernameScene'
import { FindUserByEmailScene } from './admin/users/findUserByEmailScene'
import { setUserGroupSerial } from './admin/users/setUserGroupSerial'
import { SetUsersGroupsScene } from './admin/users/setUsersGroupsScene'
import { GetTableScene } from './admin/getTableScene'
import { UserAdminScene } from './admin/userAdminScene'
import { CourseScene } from './courseScene'
import { EndScene } from './endScene'
import { AddContractScene } from './admin/mos/addContractScene'
import { cfSerial } from './cfSerial'
import { restartUserSerial } from './admin/users/restartUserSerial'
import { banUserSerial } from './admin/users/banUserSerial'
import { unbanUserSerial } from './admin/users/unbanUserSerial'
import { newsletterSerial } from './admin/newsletterSerial'

export const createScenes = (): BaseScene<BotContextMessageUpdate>[] => {
    const scenes = [
        new GroupScene(ScenesId.GROUP_SCENE),
        new TestScene(ScenesId.TEST_SCENE),
        new CourseScene(ScenesId.COURSE_SCENE),
        new EndScene(ScenesId.END_SCENE),

        new LoadCfAccountsScene(ScenesId.ADMIN_CF_ACCOUNTS_SCENE),
        new FindUserByNameScene(ScenesId.ADMIN_FIND_USER_BY_NAME_SCENE),
        new FindUserByUsernameScene(ScenesId.ADMIN_FIND_USER_BY_USERNAME_SCENE),
        new FindUserByEmailScene(ScenesId.ADMIN_FIND_USER_BY_EMAIL_SCENE),
        new SetUsersGroupsScene(ScenesId.ADMIN_SET_USERS_GROUPS_SCENE),
        new GetTableScene(ScenesId.ADMIN_GET_TABLE_SCENE),
        new UserAdminScene(ScenesId.ADMIN_USER_ADMIN),
        new AddContractScene(ScenesId.ADMIN_MOS_ADD_CONTRACT_SCENE),
    ].map((scene) => scene.create())

    return scenes.concat(
        createSerialScenes(ScenesId.USER_INFO_SCENE, ...userInfoSerial),
        createSerialScenes(ScenesId.CONTEST_SCENE, ...contestsSerial),
        createSerialScenes(ScenesId.MOS_SCENE, ...mosSerial),
        createSerialScenes(ScenesId.CF_SCENE, ...cfSerial),

        createSerialScenes(ScenesId.ADMIN_MOS_SCENE, ...loadMosSerial),
        createSerialScenes(ScenesId.ADMIN_SET_USER_GROUP_SCENE, ...setUserGroupSerial),
        createSerialScenes(ScenesId.ADMIN_RESTART_USER, ...restartUserSerial),
        createSerialScenes(ScenesId.ADMIN_BAN_USER, ...banUserSerial),
        createSerialScenes(ScenesId.ADMIN_UNBAN_USER, ...unbanUserSerial),
        createSerialScenes(ScenesId.ADMIN_NEWSLETTER, ...newsletterSerial),
    )
}
