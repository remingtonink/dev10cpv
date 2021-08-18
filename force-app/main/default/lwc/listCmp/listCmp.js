import { LightningElement,api } from 'lwc';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Status', fieldName: 'Map_Status__c'},
    { label: '#persons', fieldName: 'Of_Persons__c', type: 'number' },
    { label: 'Floor Space', fieldName: 'Floor_Space_m2__c', type: 'number' },
    { label: 'Ground Surface', fieldName: 'Ground_Surface_m2__c', type: 'number' },
    { label: 'Price', fieldName: 'Total_Price_excl_Discount__c', type: 'currency' },
];


export default class ListCmp extends LightningElement {   

    columns = columns;

    @api error;
    cottages;


    @api 
    get stones(){
        return this.cottages;
    };
    set stones(value){
        this.cottages = value;
    }  
}