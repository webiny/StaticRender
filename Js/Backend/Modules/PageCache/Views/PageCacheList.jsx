import React from 'react';
import Webiny from 'webiny';
import ContentModal from './ContentModal';
import FetchAsBotModal from './FetchAsBotModal';
import RefreshCacheModal from './RefreshCacheModal';

/**
 * @i18n.namespace StaticRender.Backend.PageCache.PageCacheList
 */
class PageCacheList extends Webiny.Ui.View {
    constructor(props) {
        super(props);

        this.state = {
            search: Webiny.Router.getQueryParams('_searchQuery')
        };

        this.bindMethods('clearAllCache');
    }

    clearAllCache() {
        return new Webiny.Api.Endpoint('/entities/static-render/cache').delete('/').then(() => {
            this.cacheList.loadData();
        });
    }
}

PageCacheList.defaultProps = {

    renderer() {
        const listProps = {
            ref: ref => this.cacheList = ref,
            api: '/entities/static-render/cache',
            fields: 'url,ttl,statusCode,createdOn,ip,userAgent,ref',
            connectToRouter: true,
            searchFields: 'url'
        };

        const searchProps = {
            placeholder: 'Search by url...',
            name: '_searchQuery'
        };

        const {ViewSwitcher, View, Link, Icon, List, Dropdown, Input, Grid, ClickConfirm} = this.props;

        return (
            <ViewSwitcher>
                <ViewSwitcher.View view="pageCacheViewView" defaultView>
                    {({showView}) => (
                        <view>
                            <View.List>
                                <View.Header title={this.i18n('Page Cache')}>
                                    <Link type="default" align="right" onClick={showView('fetchAsBotView')}>
                                        <Icon icon="fa fa-bug"/>
                                        Fetch as Bot
                                    </Link>
                                    <ClickConfirm message={this.i18n('Are you sure you want to clear all cache?')}>
                                        <Link type="default" align="right" onClick={this.clearAllCache}>
                                            <Icon icon="fa fa-trash-o"/>
                                            Clear all cache
                                        </Link>
                                    </ClickConfirm>
                                </View.Header>

                                <View.Body>
                                    <List {...listProps}>
                                        <List.FormFilters>
                                            {({apply}) => (
                                                <Grid.Row>
                                                    <Grid.Col all={12}>
                                                        <Input {...searchProps} onEnter={apply()}/>
                                                    </Grid.Col>
                                                </Grid.Row>
                                            )}
                                        </List.FormFilters>

                                        <List.Table>
                                            <List.Table.Row>
                                                <List.Table.Field name="url" align="left" label={this.i18n('Url')} sort="url">
                                                    {({data}) => (
                                                        <div>
                                                            <strong>{data.url}</strong><br/>
                                                            <small>{data.userAgent}</small>
                                                            <br/>
                                                            <small>{data.ref}</small>
                                                        </div>
                                                    )}
                                                </List.Table.Field>
                                                <List.Table.Field name="ip" align="center" label={this.i18n('IP')} sort="ip"/>
                                                <List.Table.Field name="statusCode" align="center" label={this.i18n('Status Code')} sort="statusCode"/>
                                                <List.Table.TimeAgoField name="ttl" align="left" label={this.i18n('Expires')} sort="ttl"/>
                                                <List.Table.TimeAgoField name="createdOn" align="left" label={this.i18n('Created')} sort="createdOn"/>

                                                <List.Table.Actions>
                                                    <List.Table.Action
                                                        label={this.i18n('View content')}
                                                        icon="fa-code"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('contentView')}/>
                                                    <List.Table.Action
                                                        label={this.i18n('Refresh cache')}
                                                        icon="fa-refresh"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('refreshCacheView')}/>
                                                    <Dropdown.Divider/>
                                                    <List.Table.DeleteAction label={this.i18n('Purge cache')}/>
                                                </List.Table.Actions>
                                            </List.Table.Row>
                                        </List.Table>
                                        <List.Pagination/>
                                    </List>
                                </View.Body>
                            </View.List>
                        </view>
                    )}
                </ViewSwitcher.View>

                <ViewSwitcher.View view="contentView" modal>
                    {({showView, data: {data}}) => <ContentModal {...{showView, data}} />}
                </ViewSwitcher.View>

                <ViewSwitcher.View view="fetchAsBotView" modal>
                    {() => <FetchAsBotModal/>}
                </ViewSwitcher.View>

                <ViewSwitcher.View view="refreshCacheView" modal>
                    {({data: {data}}) => <RefreshCacheModal data={data}/>}
                </ViewSwitcher.View>
            </ViewSwitcher>
        );
    }
};

export default Webiny.createComponent(PageCacheList, {
    modules: [
        'ViewSwitcher', 'View', 'Link', 'Icon', 'List', 'Dropdown', 'Input', 'Grid', 'ClickConfirm'
    ]
});