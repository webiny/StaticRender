import Webiny from 'Webiny';
import ContentModal from './ContentModal';
import FetchAsBotModal from './FetchAsBotModal';
import RefreshCacheModal from './RefreshCacheModal';
const Ui = Webiny.Ui.Components;
const Table = Ui.List.Table;

class PageCacheList extends Webiny.Ui.View {
    constructor(props) {
        super(props);

        this.state = {
            search: Webiny.Router.getQueryParams('_searchQuery')
        };

        this.bindMethods('clearAllCache');
    }

    clearAllCache(){
        return new Webiny.Api.Endpoint('/entities/static-render/cache').get('/delete-all').then(apiResponse => {
            this.ui('myList').loadData();
        });
    }
}

PageCacheList.defaultProps = {

    renderer() {
        const listProps = {
            api: '/entities/static-render/cache',
            fields: 'url,ttl,createdOn',
            connectToRouter: true,
            searchFields: 'url'
        };

        const searchProps = {
            placeholder: 'Search by url...',
            name: '_searchQuery'
        };

        return (
            <Ui.ViewSwitcher>
                <Ui.ViewSwitcher.View view="pageCacheViewView" defaultView>
                    {showView => (
                        <view>
                            <Ui.View.List>
                                <Ui.View.Header title="Page Cache">
                                    <Ui.Link type="default" align="right" onClick={showView('fetchAsBotView')}>
                                        <Ui.Icon icon="fa fa-bug"/>
                                        Fetch as Bot
                                    </Ui.Link>
                                    <Ui.ClickConfirm message="Are you sure you want to clear all cache?">
                                        <Ui.Link type="default" align="right" onClick={this.clearAllCache}>
                                            <Ui.Icon icon="fa fa-trash-o"/>
                                            Clear all cache
                                        </Ui.Link>
                                    </Ui.ClickConfirm>
                                </Ui.View.Header>

                                <Ui.View.Body>
                                    <Ui.List ui="myList" {...listProps}>

                                        <Ui.List.FormFilters>
                                            {(applyFilters, resetFilters) => (
                                                <Ui.Grid.Row>
                                                    <Ui.Grid.Col all={12}>
                                                        <Ui.Input {...searchProps} onEnter={applyFilters()}/>
                                                    </Ui.Grid.Col>
                                                </Ui.Grid.Row>
                                            )}
                                        </Ui.List.FormFilters>

                                        <Table>
                                            <Table.Row>
                                                <Table.Field name="url" align="left" label="Url" sort="url"/>
                                                <Table.TimeAgoField name="ttl" align="left" label="Expires" sort="ttl"/>
                                                <Table.TimeAgoField name="createdOn" align="left" label="Created" sort="createdOn"/>

                                                <Table.Actions>
                                                    <Table.Action
                                                        label="View content"
                                                        icon="fa-code"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('contentView')}/>
                                                    <Table.Action
                                                        label="Refresh cache"
                                                        icon="fa-refresh"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('refreshCacheView')}/>
                                                    <Ui.Dropdown.Divider/>
                                                    <Table.DeleteAction label="Purge cache"/>
                                                </Table.Actions>

                                            </Table.Row>
                                        </Table>
                                        <Ui.List.Pagination/>
                                    </Ui.List>
                                </Ui.View.Body>
                            </Ui.View.List>
                        </view>
                    )}
                </Ui.ViewSwitcher.View>

                <Ui.ViewSwitcher.View view="contentView" modal>
                    {(showView, data) => <ContentModal {...{showView, data}} />}
                </Ui.ViewSwitcher.View>

                <Ui.ViewSwitcher.View view="fetchAsBotView" modal>
                    {(showView, data) => <FetchAsBotModal {...{showView, data}} />}
                </Ui.ViewSwitcher.View>

                <Ui.ViewSwitcher.View view="refreshCacheView" modal>
                    {(showView, data) => <RefreshCacheModal {...{showView, data}} />}
                </Ui.ViewSwitcher.View>


            </Ui.ViewSwitcher>
        );
    }
};

export default PageCacheList;