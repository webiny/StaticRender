import Webiny from 'Webiny';

class RefreshCacheModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.state = {
            jobRunning: true,
            status: 'info',
            message: 'Fetching new content and refreshing cache ... please wait',
            cacheId: this.props.data.id,
            content: ''
        };

        this.bindMethods('refreshContent');
        this.refreshContent();
    }

    refreshContent() {
        const api = new Webiny.Api.Endpoint('/entities/static-render/cache');
        return api.get('/refresh/' + this.props.data.id).then(ar => {
            if (ar.response.status !== 200) {
                this.setState({
                    status: 'error',
                    message: 'Oopss..something went wrong',
                    jobRunning: false
                });

                return;
            }

            this.setState({
                status: 'success',
                message: 'Cache was successfully refreshed',
                jobRunning: false,
                content: ar.getData('content')
            });
        });
    }

    renderDialog() {
        return (
            <Modal.Dialog className="modal-full-width">
                <Modal.Content>
                    <Modal.Header title="Refreshing cache ..."/>
                    <Modal.Body>
                        <Alert type={this.state.status}>{this.state.message}</Alert>

                        {this.state.jobRunning && (
                            <div style={{position: 'relative'}}>
                                <div className="loading-overlay">
                                    <div className="loading-overlay__icon-wrapper">
                                        <div className="loading-overlay__icon"/>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(!this.state.jobRunning && this.state.status === 'success') && (
                            <CodeEditor readOnly={true} label="Content" name="content" value={this.state.content}/>
                        )}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button label="Close" disabled={this.state.jobRunning && 'disabled'} onClick={this.hide}/>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(RefreshCacheModal, {modules: ['Modal', 'Alert', 'CodeEditor', 'Button']});