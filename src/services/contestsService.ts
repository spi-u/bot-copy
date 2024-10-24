import axios, { AxiosInstance, Method } from 'axios'
import { ConfigService } from './configService'
import { getRandomString } from '../utils'
import { Student, TgUser } from '../models'

const CONTESTS_API_URL = 'https://contest.nlogn.info/api/'

const contestsMethods = {
    createUser: 'admin/users',
    findUserByUsername: 'admin/users/username',
    findUserByEmail: 'admin/users/email',
    getTgCode: (userId: number) => `admin/telegram/${userId}`,
    getGroup: (groupId: number) => `admin/groups/${groupId}`,
    updateGroup: (groupId: number) => `admin/groups/${groupId}`,
    getGroupContests: (groupId: number) => `admin/groups/${groupId}/contests`,
    getRatingTable: 'admin/ratingTable',
}

type UserCreationRequestData = {
    firstName: string
    lastName: string
    password: string
    username: string
    groupIds: number[]
}

interface UserData {
    id: number
    email: string
    username: string
    fullName: string
}

type UserResponseData = UserData

type UserTelegramResponseData = {
    linkKey: string
    userId: number
}

type GroupTelegramResponseData = {
    group: {
        id: number
        color: string
        name: string
    }
    users: {
        id: number
    }[]
}

type GroupUpdateDataRequest = {
    groupId: number
    color: string
    name: string
    userIds: number[]
}

interface ContestData {
    id: number
    name: string
}

type GroupContestsResponseData = ContestData[] | null

interface GetTableResponseData {
    header: {
        row: ContestData[]
    }
    rows: {
        user: UserData
        row: number[][]
        scoreInTime: number
        scoreInPractice: number
        scoreSum: number
    }[]
}

export interface GetFullTableResponseData {
    header: {
        contestId: number
        contestName: string
        problems: {
            title: string
            index: string
        }[]
    }[]
    rows: {
        userId: number
        userName: string
        row: {
            contestId: number
            cells: {
                isSolved: boolean
                retriesNumber: number
            }[]
            score: number
        }[]
        score: number
    }[]
}

export type RatingTable = (string | number)[][]

export class ContestsService {
    private axiosInstance: AxiosInstance

    constructor(configService: ConfigService) {
        const token = configService.get('nlognToken')

        this.axiosInstance = axios.create({
            baseURL: CONTESTS_API_URL,
            withCredentials: true,
            headers: {
                Cookie: `auth.token=${token}`,
            },
        })
    }

    private async makeApiRequest<T>(method: Method, url: string, data: any = undefined) {
        let response
        if (method === 'GET') {
            response = await this.axiosInstance.get<T>(url, {
                params: data,
            })
        } else if (method === 'POST') {
            response = await this.axiosInstance.post<T>(url, data)
        } else {
            throw new Error('Method is not supported')
        }

        return response.data
    }

    async createNewUser(data: Omit<UserCreationRequestData, 'username' | 'password'>) {
        const requestData: UserCreationRequestData = {
            ...data,
            username: this.getNewUsername(),
            password: getRandomString(6),
        }
        const result = await this.makeApiRequest<UserResponseData>(
            'POST',
            contestsMethods.createUser,
            requestData,
        )

        return { ...result, password: requestData.password }
    }

    private getNewUsername(): string {
        return `user${Date.now() % 1000000}`
    }

    async findUser(username: string) {
        return await this.makeApiRequest<UserResponseData>(
            'GET',
            contestsMethods.findUserByUsername,
            {
                username,
            },
        )
    }

    async getTelegramCode(userId: number) {
        const result = await this.makeApiRequest<UserTelegramResponseData>(
            'GET',
            contestsMethods.getTgCode(userId),
        )

        if (!result.linkKey) {
            return null
        }
        return result.linkKey
    }

    async getGroup(groupId: number) {
        const group = await this.makeApiRequest<GroupTelegramResponseData>(
            'GET',
            contestsMethods.getGroup(groupId),
        )

        if (!group) {
            throw new Error(`Group with id=${groupId} is not found.`)
        }

        return group
    }

    async addUserToGroup(groupId: number, userId: number) {
        const groupData = await this.getGroup(groupId)

        const userIds = groupData.users.map((u) => u.id)

        if (userIds.includes(userId)) {
            return null
        }

        userIds.push(userId)

        const groupUpdateData: GroupUpdateDataRequest = {
            groupId: groupData.group.id,
            color: groupData.group.color,
            name: groupData.group.name,
            userIds,
        }

        return await this.makeApiRequest(
            'POST',
            contestsMethods.updateGroup(groupId),
            groupUpdateData,
        )
    }

    async removeUserFromGroup(groupId: number, userId: number) {
        const groupData = await this.getGroup(groupId)

        let userIds = groupData.users.map((u) => u.id)

        // Пользователь не состоит в группе
        if (!userIds.includes(userId)) {
            return null
        }

        userIds = userIds.filter((id) => id !== userId)

        const groupUpdateData: GroupUpdateDataRequest = {
            groupId: groupData.group.id,
            color: groupData.group.color,
            name: groupData.group.name,
            userIds,
        }

        return await this.makeApiRequest(
            'POST',
            contestsMethods.updateGroup(groupId),
            groupUpdateData,
        )
    }

    async getGroupContestsIds(groupId: number) {
        const contests = await this.makeApiRequest<GroupContestsResponseData>(
            'GET',
            contestsMethods.getGroupContests(groupId),
        )
        if (!contests) {
            return null
        }

        return contests.map((c) => c.id)
    }

    async getRatingTable(contestIds: number[], timeIntervalInMs: number): Promise<RatingTable> {
        const tableData = await this.makeApiRequest<GetTableResponseData>(
            'POST',
            contestsMethods.getRatingTable,
            {
                contestIds,
                scoreInTime: 2,
                scoreInPractice: 1,
                timeIntervalInMs,
            },
        )

        const contestsTitlesHeader = []
        const contestsScoresTitlesHeader = []

        for (const contest of tableData.header.row) {
            const contestTitle = `#${contest.id}`
            contestsTitlesHeader.push(contestTitle)
            contestsTitlesHeader.push(contestTitle)
            contestsScoresTitlesHeader.push('Во время')
            contestsScoresTitlesHeader.push('После')
        }

        const header = [
            ['Место', 'Участник', ...contestsTitlesHeader, 'Общее', 'Общее', 'Общее'],
            ['Место', 'Участник', ...contestsScoresTitlesHeader, 'Во время', 'После', 'Сумма'],
        ]

        const contestResultsRows: number[][] = []

        for (const contestResult of tableData.rows) {
            const resultRow: number[] = []
            contestResult.row.forEach((result) => {
                resultRow.push(result[0])
                resultRow.push(result[1])
            })
            contestResultsRows.push(resultRow)
        }

        const content = tableData.rows.map((data, index) => [
            index + 1,
            data.user.fullName,
            ...contestResultsRows[index],
            data.scoreInTime,
            data.scoreInPractice,
            data.scoreSum,
        ])

        return [...header, ...content]
    }

    async getRatingTableData(contestIds: number[], timeIntervalInMs = 0) {
        return await this.makeApiRequest<GetFullTableResponseData>('POST', 'admin/getFullTable', {
            contestIds,
            timeIntervalInMs,
        })
    }

    async createFullRatingTable(tableData: GetFullTableResponseData, isForAdmin = false) {
        const header = isForAdmin
            ? [
                  ['', '', '', ''],
                  ['Id студента', 'Имя пользователя TG', '', ''],
              ]
            : [
                  ['', ''],
                  ['', ''],
              ]

        for (const contest of tableData.header) {
            for (const problem of contest.problems) {
                header[0].push(`#${contest.contestId}`)
                header[1].push(problem.index.toUpperCase())
            }
            header[0].push('')
            header[1].push('Сумма')
        }

        const data: (string | number)[][] = []

        for (const userData of tableData.rows) {
            let current: (string | number)[] = []

            if (isForAdmin) {
                const currentStudent = await Student.findOne({
                    include: {
                        model: TgUser,
                        as: 'user',
                    },
                    where: {
                        nlognId: userData.userId,
                    },
                })
                current = [
                    currentStudent ? currentStudent.id : 'не найден',
                    currentStudent ? currentStudent.user.tg_username || 'нет' : 'не найден',
                ]
            }
            current.push(userData.userName, userData.score)

            for (const contestData of userData.row) {
                for (const problemData of contestData.cells) {
                    current.push(
                        problemData.retriesNumber
                            ? (problemData.isSolved ? '+' : '-') +
                                  `${problemData.retriesNumber - 1 ? problemData.retriesNumber - 1 : ''}`
                            : '',
                    )
                }
                current.push(contestData.score)
            }

            data.push(current)
        }

        const resultTable = [...header, ...data]

        return resultTable
    }
}
