import { logger } from '../services'

class TaskManager {
    public ms: number
    public name: string

    private interval: NodeJS.Timer | null = null
    private readonly _task: () => Promise<void>

    constructor(name: string, task: () => Promise<void>, ms: number) {
        this.ms = ms
        this.name = name

        this._task = () =>
            Promise.resolve()
                .then(() => {
                    return task()
                })
                .catch((reason) => logger.error(reason))
    }

    start() {
        this.interval = setInterval(this._task, this.ms)
        logger.info(`Launched task ${this.name}`)
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
    }
}

export default TaskManager
