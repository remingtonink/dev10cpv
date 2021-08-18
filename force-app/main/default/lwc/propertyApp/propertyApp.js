import { LightningElement,api } from 'lwc';
//import getCottages from '@salesforce/apex/HeatMapStream.getCottages';
import getCottages from '@salesforce/apex/PropertyAppController.getCottages';
import IMAGES from '@salesforce/resourceUrl/Images';

const MAP_OPTION = 'showMap';
const LIST_OPTION = 'showList';


export default class PropertyApp extends LightningElement {

    cottages;
	filters;
    error;

	//images	
    headerImage = IMAGES + '/header.PNG';
    logoImage = IMAGES + '/logo.PNG';

	//radio toggle
	showMap = true;
	radioValue = MAP_OPTION;

	//for modal
	modalOpened = false;
	selectedId;
	selectedCottage;

    get radioOptions() {
        return [
            { label: 'Map', value: MAP_OPTION },
            { label: 'List', value: LIST_OPTION },
        ];
    }

    connectedCallback() {
		this.initFilters();
		this.loadCottages();
	}

	initFilters(){
		this.filters = {
			cottageTypes: [],
			nrOfPeople: []
		}
	}

	loadCottages() {	
		console.log('propertyApp > loadCottages > this.filters:');	
		console.log(JSON.stringify(this.filters));	
		
		getCottages({data:this.filters})
			.then(result => {
				this.cottages = result;
                console.log('propertyApp.js > loadCottages > length = '+result.length);
			})
			.catch(error => {
				this.error = error;
			});
	}

	//event handlers	
	processFilters(e){
		console.log('propertyApp > processFilters()');
		this.filters = e.detail;
		this.loadCottages();
	}
	processCottageSelect(e){
		this.selectedId = e.detail;
		this.modalOpened = true;
	}	
	radioToggle(e){	
		let value = e.detail.value;	
		this.showMap = (value == MAP_OPTION);
	}
	closeModal(e){
		this.modalOpened = false;
	}
}