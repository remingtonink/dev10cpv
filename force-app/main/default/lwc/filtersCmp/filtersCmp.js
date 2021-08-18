import { LightningElement,api } from 'lwc';
const PRICE_STEP = 1000;

export default class FiltersCmp extends LightningElement {

    //variables
    @api priceMinLimit;
    @api priceMaxLimit;
    @api priceMin;
    @api priceMax;

    @api filters;
    cottageTypes = [];
    nrOfPeople;

    properties;
    optionsSet = false;

    typeOptions;
    nrOfPeopleOptions;

    priceStep = PRICE_STEP;
    
    //advanced variables
    @api get cottages(){
        return this.properties;
    }
    
    set cottages(newValue){
        this.properties = newValue;
        if(!this.optionsSet && this.properties && this.properties.length > 0){
            
            //determine options & other default values
            this.typeOptions = this.retrieveOptions('CottageType__c');
            this.nrOfPeopleOptions = this.retrieveOptions('Of_Persons__c');
            this.retrievePrices();

            this.optionsSet = true;
        }
    }

    //onchange handlers
    updateType(e){        
        this.cottageTypes = e.detail;  
        this.handleNewFilters();      
    }
    updateNrOfPeople(e){
        this.nrOfPeople = e.detail;
        this.handleNewFilters();
    }
    updatePriceMin(e){
        this.priceMin = e.target.value;
        this.handleNewFilters();
    }
    updatePriceMax(e){
        this.priceMax = e.target.value;
        this.handleNewFilters();
    }

    //send event
    handleNewFilters(){
        console.log('filtersCmp > event: sending new filters to parent....');
        this.dispatchEvent(new CustomEvent('setfilters',{detail:this.retrieveFilters()}));
    }
    retrieveFilters(){
        let priceMaxTemp =(this.priceMax) ? this.priceMax : this.priceMaxLimit;

        return new Object({
            cottageTypes: (this.cottageTypes) ? this.cottageTypes : [],
            nrOfPeople: (this.nrOfPeople) ? this.nrOfPeople : [],
            priceMin: (this.priceMin) ? this.priceMin : this.priceMinLimit,
            priceMax: (priceMaxTemp > 1000000) ? null : priceMaxTemp
        });
    }    

    /* SETS INITIAL VALUES (EXECUTED ONCE)*/

	retrievePrices(){
        //all the prices
        let sortedList = this.retrieveOptions('Total_Price_excl_Discount__c');

        //minimum
		let priceMinLimitTemp = Number(sortedList[0].label);
        this.priceMinLimit = Math.floor(priceMinLimitTemp / 1000)*1000;
		this.priceMin = this.priceMinLimit;

        //maximum
		let priceMaxLimitTemp = Number(sortedList[sortedList.length-1].label);
        this.priceMaxLimit = Math.ceil(priceMaxLimitTemp / 1000)*1000;
		this.priceMax = this.priceMaxLimit;
	}    

	retrieveOptions(fieldName){
		//extract labels+values
		let startList = [];
        for(let c of this.properties){
            startList.push(String(c[fieldName]));
        }

		//sort
		let sortedList = startList.sort((a,b)=> a-b )
        .filter((value,index,array) => array.indexOf(value) === index); //unique 
        
        //convert list to map
		return sortedList.map(price => {
			let varString = String(price);
			return {label:varString,value:false};
		});
	}

    
}