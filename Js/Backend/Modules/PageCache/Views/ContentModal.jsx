import React from 'react';
import Webiny from 'webiny';

/**
 * @i18n.namespace StaticRender.Backend.PageCache.ContentModal
 */
class ContentModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);

        this.state = {
            content: '',
            cacheId: this.props.data.id
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.getContent();
    }

    getContent() {
        const api = new Webiny.Api.Endpoint('/entities/static-render/cache');
        return api.get('/' + this.state.cacheId).then(ar => {
            this.setState({
                content: ar.getData('entity.content')
            });
        });
    }

    renderDialog() {
        const {Modal, Button, CodeEditor} = this.props;

        return (
            <Modal.Dialog wide={true}>
                <Modal.Content>
                    <Modal.Header title={this.i18n('Page Cache')}/>
                    <Modal.Body>
                        {this.state.content!='' && <CodeEditor readOnly={true} label={this.i18n('Content')} value={this.state.content} height="auto" autoFormat={true}/>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button label={this.i18n('Close')} onClick={this.hide}/>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(ContentModal, {modules: ['Modal', 'Button', 'CodeEditor']});