import { ConfigurationOptions, I18n, TranslateOptions } from 'i18n'
import { middlewareFn } from './middlewares/types'
import { BotContext } from './types'

class BotI18n {
    _i18n: I18n
    constructor(options: ConfigurationOptions) {
        this._i18n = new I18n(options)
    }

    middleware(): middlewareFn<BotContext> {
        return (ctx, next) => {
            if (ctx.session.state && ctx.session.state.localeCode) {
                this._i18n.setLocale(ctx.session.state.localeCode)
            }
            ctx.i18n = this._i18n
            return next()
        }
    }
}

export default BotI18n
