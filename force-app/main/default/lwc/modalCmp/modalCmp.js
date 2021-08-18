import { LightningElement,api } from 'lwc';

export default class ModalCmp extends LightningElement {
    @api selectedId;

    closeModal(){        
        console.log('Closing modal!');
        this.dispatchEvent(new CustomEvent('modalclose'));
    }
}   