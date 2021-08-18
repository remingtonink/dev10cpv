import { LightningElement,api } from 'lwc';

export default class ToggleButtonGroup extends LightningElement {
    @api toggles;
    @api maxButtonsPerRow

    @api get buttonsPerRowMax(){
        return "slds-col slds-size_1-of-"+ this.maxButtonsPerRow +' slds-p-vertical_x-small';
    }

    handleToggle(e){
        //create new array with updated value
        let newToggles = [];
        for(let toggle of this.toggles){
            let newToggle = {label: toggle.label, value:toggle.value};
            if(toggle.label === e.detail.label){
                newToggle.value = e.detail.value;
            }
            newToggles.push(newToggle);
        }

        //save result and fire event
        this.toggles = newToggles;
        this.sendNewFilters();
    }

    sendNewFilters(){  
        let activeToggles = [];
        for(let toggle of this.toggles){
            if(toggle.value){
                activeToggles.push(toggle.label);
            }
        }

        this.dispatchEvent(
            new CustomEvent('updatefilter',{
                detail:activeToggles
            })
        );
    }
}