import Webiny from 'Webiny';
import PageCache from './Modules/PageCache'

class StaticRender extends Webiny.App {
    constructor() {
        super('StaticRender.Backend');
        this.modules = [
            new PageCache(this)
        ];
    }
}

Webiny.registerApp(new StaticRender());