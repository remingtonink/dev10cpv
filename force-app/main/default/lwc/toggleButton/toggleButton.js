import { LightningElement,api } from 'lwc';

export default class ToggleButton extends LightningElement {

    @api toggleLabel;
    @api toggleOn = false;

    @api get toggleVariant(){
        if(this.toggleOn){
            //return "brand";
            return "slds-button slds-button_brand slds-button_stretch";
        }else{
            //return "Neutral";
            return "slds-button slds-button_neutral slds-button_stretch";
        }
    }

    handleClick(e){
        this.toggleOn = !this.toggleOn;
                
        this.dispatchEvent(
            new CustomEvent('buttontoggled',{
                detail:{
                    label:this.toggleLabel,
                    value:this.toggleOn
                }
            })
        );
    }
}