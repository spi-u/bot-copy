import axios, { AxiosInstance } from 'axios'
import { ParsedUrlQueryInput } from 'querystring'
import * as crypto from 'crypto'
import { getRandomString } from '../utils'
import { filter, sortBy, toString } from 'lodash'
import { ConfigService } from './configService'

export interface CfContestResult {
    id: number
    contestId: number
    problem: {
        index: string
        name: string
    }
    author: {
        members: {
            handle: string
        }[]
    }
    verdict: string
}

interface CfContestStatus {
    status: string
    result: CfContestResult[]
}

const CF_API_URL = 'https://codeforces.com/api/'
const CF_METHOD_GET_CONTEST_STATUS = 'contest.status'

enum Verdicts {
    OK = 'OK',
}

export class CfService {
    private readonly key: string
    private readonly secret: string

    private axiosInstance: AxiosInstance

    constructor(configService: ConfigService) {
        this.key = configService.get('cf.key')
        this.secret = configService.get('cf.secret')

        this.axiosInstance = axios.create({
            baseURL: CF_API_URL,
        })
    }

    async makeApiQuery<T>(uri: string, params: ParsedUrlQueryInput) {
        const time = Math.floor(Date.now() / 1000)
        const salt = getRandomString(6)

        const requestParams: ParsedUrlQueryInput = {
            ...params,
            apiKey: this.key,
            time: time,
        }

        // Из документации api cf: (param_1, value_1), (param_2, value_2),..., (param_n, value_n) — это все параметра запроса (включая apiKey и time, но исключая apiSig)
        // с соответствующими значениями отсортированные лексикографически в первую очередь по param_i, во вторую очередь по value_i
        const qsSig = sortBy(Object.entries(requestParams), [
            ([param]) => param,
            ([_, key]) => toString(key),
        ])
            .map((o) => o.join('='))
            .join('&')

        const hash = crypto
            .createHash('sha512')
            .update(`${salt}/${uri}?${qsSig}#${this.secret}`)
            .digest('hex')

        requestParams.apiSig = `${salt}${hash}`
        const response = await this.axiosInstance.get<T>(uri, {
            params: requestParams,
        })
        return response.data
    }

    async getStudentResults(contestId: number, cfHandle: string) {
        const studentsResults = await this.makeApiQuery<CfContestStatus>(
            CF_METHOD_GET_CONTEST_STATUS,
            {
                contestId,
                asManager: 'true',
            },
        )

        if (!studentsResults.result) {
            console.log(studentsResults)
            throw new Error('Some problems with cf response')
        }

        return filter(
            studentsResults.result,
            (result) => result.author.members[0].handle.split('=')[1] === cfHandle,
        )
    }

    async getStudentResultsWithSolvedProblem(contestId: number, cfHandle: string) {
        const studentResults = await this.getStudentResults(contestId, cfHandle)

        const filteredStudentResults = filter(
            studentResults,
            (result) => result.verdict === Verdicts.OK,
        )
        const resultsByProblems: {
            [index: string]: CfContestResult
        } = {}
        for (const result of filteredStudentResults) {
            if (!(result.problem.index in resultsByProblems)) {
                resultsByProblems[result.problem.index] = result
            }
        }
        return sortBy(Object.values(resultsByProblems), [
            function (o) {
                return o.problem.index
            },
        ])
    }
}
