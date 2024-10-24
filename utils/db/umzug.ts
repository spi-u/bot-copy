import { Umzug, SequelizeStorage } from 'umzug'
import db from '../../src/db'

export const migrator = new Umzug({
    migrations: { glob: ['migrations/*.ts', { cwd: __dirname }] },
    context: db.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db }),
    logger: console,
})

export type Migration = typeof migrator._types.migration
