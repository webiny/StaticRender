import React from 'react';
import Webiny from 'Webiny';

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
        const {Modal, Button, CodeEditor} = this.props;
        return (
            <Modal.Dialog className="modal-full-width">
                <Modal.Content>
                    <Modal.Header title="Page Cache"/>
                    <Modal.Body>
                        <CodeEditor readOnly={true} label="Content" name="content" value={this.state.content}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button label="Close" onClick={this.hide}/>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(ContentModal, {modules: ['Modal', 'Button', 'CodeEditor']});