import Webiny from 'Webiny';
import Views from './Views/Views';

class PageCache extends Webiny.Module {

    init() {
        this.name = 'PageCache';
        const Menu = Webiny.Ui.Menu;
        const role = 'static-render';

        this.registerMenus(
            new Menu('System', [
                new Menu('Static Render', 'StaticRender.PageCache').setRole(role)
            ], 'icon-tools')
        );

        this.registerRoutes(
            new Webiny.Route('StaticRender.PageCache', '/static-render/page-cache', Views.PageCacheList, 'Static Render - Page Cache').setRole(role)
        );
    }
}

export default PageCache;