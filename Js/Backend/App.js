import Webiny from 'Webiny';
import Jobs from './Modules/Jobs'

class CronManager extends Webiny.App {
    constructor() {
        super('CronManager.Backend');
        this.modules = [
            new Jobs(this)
        ];
    }
}

Webiny.registerApp(new CronManager());