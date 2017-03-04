import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

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
        form.submit();

        console.log('has error: '+form.hasError());
        console.log('is valid: '+form.isValid);

        if (form.isValid === true) {
            this.setState({
                message: 'Fetching ... please wait',
                status: 'warning'
            });
        }
    }

    renderDialog() {
        const formProps = {
            api: '/entities/static-render/cache/fetch-as-bot',
            onSubmitSuccess: (result) => {
                this.initialState();
                this.setState({content: result.getData('content')});
            }
        };

        return (
            <Ui.Modal.Dialog className="modal-full-width">
                <Ui.Modal.Header title="Fetch as Bot"/>
                <Ui.Modal.Body>
                    <Ui.Alert type={this.state.status}>{this.state.message}</Ui.Alert>

                    {this.state.jobStatus == 'waiting' && (
                        <div>
                            <Ui.Form {...formProps}>
                                {(model, form) => (
                                    <Ui.Grid.Row>
                                        <Ui.Grid.Col all={12}>
                                            <Ui.Input label="Url" name="url" validate="required,url"
                                                      placeholder="Type the url and press enter" onEnter={()=>{this.fetchUrl(form)}}/>
                                        </Ui.Grid.Col>
                                    </Ui.Grid.Row>
                                )}
                            </Ui.Form>
                            <Ui.Grid.Col all={12}>
                                {this.state.content != '' && (
                                    <Ui.SimpleCodeEditor readOnly={true} label="Content" name="content" value={this.state.content}/>
                                )}
                            </Ui.Grid.Col>
                            <div className="clearfix"></div>
                        </div>
                    )}

                </Ui.Modal.Body>
                <Ui.Modal.Footer>
                    <Ui.Button label="Close" onClick={this.hide}/>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );
    }
}

export default FetchAsBotModal;