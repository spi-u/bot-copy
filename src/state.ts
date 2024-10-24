interface UserInfoState {
    firstName?: string
    lastName?: string
    school?: string
    grade?: string
    city?: string
    schoolCity?: string
    phone?: string
    email?: string
    country?: string
}

interface UserState {
    id: number
    selectedGroupId?: number
    confirmedGroupId?: number
    confirmationCode?: string
    nlognId: number
    nlognUsername: string
    cfHandle: string
    userInfo: UserInfoState
    isFromMoscow?: boolean
    lastSelectedCourseId: number
    mosIds?: string[]
}

export interface State {
    user: UserState
    localeCode?: string
    isTesting: boolean
}

export const initialUserState: UserState = {
    id: 0,
    nlognId: 0,
    nlognUsername: '',
    cfHandle: '',
    userInfo: {},
    lastSelectedCourseId: 0,
}

export const initialBotState: State = {
    user: initialUserState,
    isTesting: false,
}
