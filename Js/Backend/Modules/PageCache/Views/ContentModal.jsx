import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class ContentModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.state = {
            content: '',
            cacheId: this.props.data.id
        };

        this.getContent();
    }

    getContent() {
        const api = new Webiny.Api.Endpoint('/entities/static-render/cache');
        return api.get('/' + this.state.cacheId).then(ar => {
            this.setState({
                content: ar.getData('content')
            });
        });
    }

    renderDialog() {
        return (
            <Ui.Modal.Dialog className="modal-full-width">
                <Ui.Modal.Header title="Page Cache"/>
                <Ui.Modal.Body>
                    <Ui.SimpleCodeEditor readOnly={true} label="Content" name="content" value={this.state.content}/>
                </Ui.Modal.Body>
                <Ui.Modal.Footer>
                    <Ui.Button label="Close" onClick={this.hide}/>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );
    }
}

export default ContentModal;