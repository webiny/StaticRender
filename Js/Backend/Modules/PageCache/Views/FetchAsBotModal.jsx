import React from 'react';
import Webiny from 'webiny';

/**
 * @i18n.namespace StaticRender.Backend.PageCache.FetchAsBotModal
 */
class FetchAsBotModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.state = {
            content: '',
            statusCode: null
        };
    }

    renderDialog() {
        const formProps = {
            api: '/entities/static-render/cache/fetch-as-bot',
            onSubmit: ({model, form}) => {
                this.setState({statusCode: null});
                return form.onSubmit(model);
            },
            onSubmitSuccess: ({apiResponse}) => {
                const data = apiResponse.getData();
                this.setState({
                    content: data.content,
                    statusCode: parseInt(data.statusCode)
                });
            },
            onSuccessMessage: null
        };

        const {Modal, Alert, Form, Grid, Input, CodeEditor, Button} = this.props;

        return (
            <Modal.Dialog wide={true}>
                <Form {...formProps}>
                    {({form}) => (
                        <Modal.Content>
                            <Form.Loader>Fetching, please wait...</Form.Loader>
                            <Modal.Header title={this.i18n('Fetch as Bot')} onClose={this.hide}/>
                            <Modal.Body>
                                {this.state.statusCode === 503 && (
                                    <Alert type="danger">The requested URL was not found.</Alert>
                                )}
                                <Grid.Row>
                                    <Grid.Col all={12}>
                                        <Input
                                            label={this.i18n('URL')}
                                            name="url"
                                            validate="required,url"
                                            description="Type in the URL to fetch as a bot. (Note: this only works with Webiny powered websites.)"
                                            placeholder={this.i18n('Type the url and press ENTER')}
                                            onEnter={form.submit}/>
                                    </Grid.Col>
                                    <Grid.Col all={12}>
                                        {this.state.content !== '' && this.state.statusCode === 200 && (
                                            <CodeEditor
                                                readOnly={true}
                                                label={this.i18n('Content')}
                                                name="content"
                                                value={this.state.content}
                                                height="auto"
                                                autoFormat={true}/>
                                        )}
                                    </Grid.Col>
                                </Grid.Row>
                                <div className="clearfix"/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button label={this.i18n('Close')} onClick={this.hide}/>
                            </Modal.Footer>
                        </Modal.Content>
                    )}
                </Form>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(FetchAsBotModal, {
    modules: ['Modal', 'Alert', 'Form', 'Grid', 'Input', 'CodeEditor', 'Button']
});