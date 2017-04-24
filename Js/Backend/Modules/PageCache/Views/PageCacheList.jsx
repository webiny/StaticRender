import Webiny from 'Webiny';
import ContentModal from './ContentModal';
import FetchAsBotModal from './FetchAsBotModal';
import RefreshCacheModal from './RefreshCacheModal';

class PageCacheList extends Webiny.Ui.View {
    constructor(props) {
        super(props);

        this.state = {
            search: Webiny.Router.getQueryParams('_searchQuery')
        };
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

        const {ViewSwitcher, View, Link, Icon, List, Dropdown, Input, Grid} = this.props;

        return (
            <ViewSwitcher>
                <ViewSwitcher.View view="pageCacheViewView" defaultView>
                    {showView => (
                        <view>
                            <View.List>
                                <View.Header title="Page Cache">
                                    <Link type="default" align="right" onClick={showView('fetchAsBotView')}>
                                        <Icon icon="fa fa-bug"/>
                                        Fetch as Bot
                                    </Link>
                                </View.Header>

                                <View.Body>
                                    <List ui="myList" {...listProps}>

                                        <List.FormFilters>
                                            {(applyFilters, resetFilters) => (
                                                <Grid.Row>
                                                    <Grid.Col all={12}>
                                                        <Input {...searchProps} onEnter={applyFilters()}/>
                                                    </Grid.Col>
                                                </Grid.Row>
                                            )}
                                        </List.FormFilters>

                                        <List.Table>
                                            <List.Table.Row>
                                                <List.Table.Field name="url" align="left" label="Url" sort="url"/>
                                                <List.Table.TimeAgoField name="ttl" align="left" label="Expires" sort="ttl"/>
                                                <List.Table.TimeAgoField name="createdOn" align="left" label="Created" sort="createdOn"/>

                                                <List.Table.Actions>
                                                    <List.Table.Action
                                                        label="View content"
                                                        icon="fa-code"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('contentView')}/>
                                                    <List.Table.Action
                                                        label="Refresh cache"
                                                        icon="fa-refresh"
                                                        type="primary"
                                                        align="right"
                                                        onClick={showView('refreshCacheView')}/>
                                                    <Dropdown.Divider/>
                                                    <List.Table.DeleteAction label="Purge cache"/>
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
                    {(showView, data) => <ContentModal {...{showView, data}} />}
                </ViewSwitcher.View>

                <ViewSwitcher.View view="fetchAsBotView" modal>
                    {(showView, data) => <FetchAsBotModal {...{showView, data}} />}
                </ViewSwitcher.View>

                <ViewSwitcher.View view="refreshCacheView" modal>
                    {(showView, data) => <RefreshCacheModal {...{showView, data}} />}
                </ViewSwitcher.View>


            </ViewSwitcher>
        );
    }
};

export default Webiny.createComponent(PageCacheList, {modules: [
    'ViewSwitcher', 'View', 'Link', 'Icon', 'List', 'Dropdown', 'Input', 'Grid'
]});