import * as fs from 'fs'
import path from 'path'
import { get } from 'lodash'

export class ConfigService {
    private readonly config: object

    constructor() {
        if (!process.env.NODE_ENV) {
            throw new Error('NODE_ENV is required')
        }

        try {
            const raw = fs.readFileSync(
                path.join(process.cwd(), `config.${process.env.NODE_ENV}.json`),
            )
            this.config = JSON.parse(raw.toString())
        } catch (e) {
            throw new Error('Config file is not found or incorrect')
        }
    }

    get(key: string): any {
        const res = get(this.config, key)
        if (!res) {
            throw new Error(`Not found value for key "${key}"`)
        }
        return res
    }
}
