import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;
const Table = Ui.List.Table;

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

        return (
            <Ui.ViewSwitcher>
                <Ui.ViewSwitcher.View view="pageCacheViewView" defaultView>
                    {showView => (
                        <view>
                            <Ui.View.List>
                                <Ui.View.Header title="Page Cache"/>

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
                                                <Table.TimeAgoField name="ttl" align="left" label="TTL" sort="ttl"/>
                                                <Table.TimeAgoField name="createdOn" align="left" label="Created" sort="createdOn"/>
                                            </Table.Row>
                                        </Table>
                                        <Ui.List.Pagination/>
                                    </Ui.List>
                                </Ui.View.Body>
                            </Ui.View.List>
                        </view>
                    )}
                </Ui.ViewSwitcher.View>

            </Ui.ViewSwitcher>
        );
    }
};

export default PageCacheList;