import { BaseScene } from 'telegraf/typings/scenes'
import { BotContextMessageUpdate } from '../types'
import { Scenes } from 'telegraf'
import { SceneOptions } from 'telegraf/typings/scenes/base'
import { SerialView } from './types'
import { commandsMiddleware } from '../middlewares/commandsMiddleware'
import { deleteMsgMiddleware } from '../middlewares/deleteMsgMiddleware'
import { SerialSceneGenerator } from './types'

class Scene<T extends BotContextMessageUpdate = BotContextMessageUpdate> {
    scene: BaseScene<T>
    sceneId: string

    constructor(sceneId: string, options?: SceneOptions<T>) {
        this.sceneId = sceneId
        this.scene = new Scenes.BaseScene<T>(sceneId, options)

        this.scene.use(commandsMiddleware())
        this.scene.use(deleteMsgMiddleware())
    }
}

class Serial<C extends BotContextMessageUpdate = BotContextMessageUpdate> implements SerialView {
    constructor(
        private readonly ctx: C,
        private readonly sceneId: string,
        private readonly currentIndex: number,
    ) {
        this.ctx = ctx
        this.sceneId = sceneId
        this.currentIndex = currentIndex
    }

    next(index?: number, initialState: object = {}) {
        return this.ctx.scene.enter(
            getSerialStepSceneId(this.sceneId, index !== undefined ? index : this.currentIndex + 1),
            initialState,
        )
    }

    restart() {
        return this.ctx.scene.enter(this.sceneId)
    }

    getCurrentIndex(): number {
        return this.currentIndex
    }
}

export function createSerialScenes(
    sceneId: string,
    ...sceneGenerators: SerialSceneGenerator[]
): BaseScene<BotContextMessageUpdate>[] {
    let counter = 0
    const scenes: BaseScene<BotContextMessageUpdate>[] = []
    for (const generator of sceneGenerators) {
        const tempCounter = counter
        const scene = new Scenes.BaseScene<BotContextMessageUpdate>(
            getSerialStepSceneId(sceneId, tempCounter),
        )

        scene.enterHandler = (ctx, next) => {
            ctx.serial = new Serial(ctx, sceneId, tempCounter)
            return next()
        }

        scene.use((ctx, next) => {
            ctx.serial = new Serial(ctx, sceneId, tempCounter)
            return next()
        })

        scene.use(deleteMsgMiddleware())
        scene.use(commandsMiddleware())

        generator(scene)
        scenes.push(scene)
        counter++
    }

    return scenes
}

export function getSerialStepSceneId(sceneId: string, cursor = 0): string {
    if (cursor === 0) return sceneId
    return `${sceneId}_${cursor}`
}

export default Scene
