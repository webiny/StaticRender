import React from 'react';
import Webiny from 'webiny';

class FetchAsBotModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.state = {
            jobStatus: 'waiting',
            status: 'info',
            message: 'Type in the url below to fetch the content as a bot.',
            content: ''
        };

        this.bindMethods('fetchUrl,initialState');
    }

    initialState() {
        this.setState({
            jobStatus: 'waiting',
            status: 'info',
            message: 'Type in the url below to fetch the content as a bot.',
            content: ''
        });
    }

    fetchUrl(form) {
        form.submit().then(() => {
            console.log('is valid:' + form.isValid());
            console.log('has error:' + form.hasError());
            if (form.isValid) {
                this.setState({
                    message: 'Fetching ... please wait',
                    status: 'warning'
                });
            }
        });
    }

    renderDialog() {
        const formProps = {
            api: '/entities/static-render/cache/fetch-as-bot',
            onSubmit: (model, form) => {
                this.setState({
                    message: 'Fetching ... please wait',
                    status: 'warning'
                });

                return form.onSubmit(model);
            },
            onSubmitSuccess: (result) => {
                this.initialState();
                this.setState({content: result.getData('content')});
            },
            onSuccessMessage: null
        };

        const {Modal, Alert, Form, Grid, Input, CodeEditor, Button} = this.props;

        return (
            <Modal.Dialog wide={true}>
                <Modal.Content>
                    <Modal.Header title="Fetch as Bot"/>
                    <Modal.Body>
                        <Alert type={this.state.status}>{this.state.message}</Alert>
                        {this.state.jobStatus === 'waiting' && (
                            <div>
                                <Form {...formProps}>
                                    {(model, form) => (
                                        <Grid.Row>
                                            <Grid.Col all={12}>
                                                <Input
                                                    label="Url"
                                                    name="url"
                                                    validate="required,url"
                                                    placeholder="Type the url and press enter"
                                                    onEnter={form.submit}/>
                                            </Grid.Col>
                                        </Grid.Row>
                                    )}
                                </Form>
                                <Grid.Col all={12}>
                                    {this.state.content !== '' && (
                                        <CodeEditor readOnly={true} label="Content" name="content" value={this.state.content} height="auto" autoFormat={true}/>
                                    )}
                                </Grid.Col>
                                <div className="clearfix"/>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button label="Close" onClick={this.hide}/>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(FetchAsBotModal, {
    modules: ['Modal', 'Alert', 'Form', 'Grid', 'Input', 'CodeEditor', 'Button']
});