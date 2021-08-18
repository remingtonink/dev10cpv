import { LightningElement, track,api, wire } from 'lwc';
import leafletjs from '@salesforce/resourceUrl/leaflet';
import IMAGES from '@salesforce/resourceUrl/Images';
import cottageData from '@salesforce/resourceUrl/cottageData';
import cottageImages from '@salesforce/resourceUrl/CottageImages';
import { loadStyle, loadScript} from 'lightning/platformResourceLoader';
import getCottages from '@salesforce/apex/HeatMapStream.getCottages';

//new apr7
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/User.LastName';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import STREET_FIELD from '@salesforce/schema/User.Street';
import POSTALCODE_FIELD from '@salesforce/schema/User.PostalCode';
import CITY_FIELD from '@salesforce/schema/User.City';
import COUNTRY_FIELD from '@salesforce/schema/User.Country';
import PHONE_FIELD from '@salesforce/schema/User.Phone';
const USER_FIELDS = [FIRST_NAME_FIELD,LAST_NAME_FIELD,EMAIL_FIELD,STREET_FIELD,POSTALCODE_FIELD,CITY_FIELD,COUNTRY_FIELD,PHONE_FIELD];

const LIMBURG = 'limburgsePeel';
const EEMHOF = 'deEemhof';

export default class HeatMap extends LightningElement {
    @track isModalOpen = false;
    @track stepNr=1;
    @track mapLoaded = false;

    cottages = [];
    @api selectedCottage;
    error;

    //new mar26
    mapH;

    //new mar31
    headerImage = IMAGES + '/header.PNG';
    logoImage = IMAGES + '/logo.PNG';
    numberOfPeople = 2;
    priceMin=130000;
    priceMax=155000;

    //new apr1
    parkSelection = LIMBURG;
    parkSelectionLocation = [51.449213, 5.964885];
    parkLimburg = [51.449213, 5.964885];
    parkEemhof = [52.260156, 5.401960];

    //new apr7
    userEmail;
    userFirstName;
    userLastName;
    userStreet;
    userPostalCode;
    userCity;
    userCountry;
    userPhone;

    //new jun1
    appResources = {
		image1: `${cottageImages}/image1.jpg`,
		image2: `${cottageImages}/image2.jpg`,
		image3: `${cottageImages}/image3.png`,
	};

    @wire(getRecord, { recordId: USER_ID, fields: USER_FIELDS})
    wireuser({error,data}) {
        if (error) {
           this.error = error ; 
        } else if (data) {
            this.userEmail = getFieldValue(data, EMAIL_FIELD);
            this.userFirstName = getFieldValue(data, FIRST_NAME_FIELD);
            this.userLastName = getFieldValue(data, LAST_NAME_FIELD);
            this.userStreet = getFieldValue(data, STREET_FIELD);
            this.userPostalCode = getFieldValue(data, POSTALCODE_FIELD);
            this.userCity = getFieldValue(data, CITY_FIELD);
            this.userCountry = getFieldValue(data, COUNTRY_FIELD);
            this.userPhone = getFieldValue(data, PHONE_FIELD);
        }
    }

    get parkOptions(){
        return [
            { label: 'Limburgse Peel', value: LIMBURG },
            { label: 'De Eemhof', value: EEMHOF },
        ];
    }

    get priceOptions() {
        return [
            { label: '130000', value: 130000 },
            { label: '135000', value: 135000 },
            { label: '140000', value: 140000 },
            { label: '145000', value: 145000 },
            { label: '150000', value: 150000 },
            { label: '155000', value: 155000 },
        ];
    }

    //filters
    handlePriceMinChange(event) {
        this.priceMin = event.detail.value;
        this.initLeaflet(this);
    }

    handlePriceMaxChange(event) {
        this.priceMax = event.detail.value;
        this.initLeaflet(this);
    }
    
    handleParkChange(event) {
        if(event.detail.value==LIMBURG){
            this.parkSelectionLocation = this.parkLimburg;
        }else if(event.detail.value==EEMHOF){
            this.parkSelectionLocation = this.parkEemhof;
        }
        this.parkSelection = event.detail.value;
        this.initLeaflet(this);
    }

    renderedCallback(){
        if(!this.mapLoaded){
            Promise.all([
                loadScript(this, leafletjs+'/leaflet.js'),
                loadStyle(this, leafletjs+'/leaflet.css'),
            ])
            .then(() => {
                this.mapLoaded = false;
                /*
                setTimeout(() => {
                    this.initLeaflet(this);         
                }, 2000);*/
                this.initLeaflet(this);         
            })
            .catch(error => {
                console.log('Leaflet promise return failed: '+error);
            })
        }
    }

    initLeaflet(windowContext){
        getCottages({priceMin:windowContext.priceMin,  priceMax:windowContext.priceMax})
        .then(result => {
            windowContext.cottages = result;

            const heatMap = this.template.querySelector(".map-root");
            
            if(windowContext.mapLoaded==true){
                windowContext.mapH.remove();
            }
            //console.log(windowContext.parkSelectionLocation);

            var mymap = L.map(heatMap,{tap:false}).setView(windowContext.parkSelectionLocation, 18);
            //var mymap = L.map(heatMap).setView([51.449069, 5.964670], 19);
            windowContext.mapH = mymap;

            
        
        //var mymap = L.map(heatMap).setView([51.449069, 5.964670], 19);
                    
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{    
            //L.tileLayer.wms('https://geodata.nationaalgeoregister.nl/kadastralekaart/wms/v4_0?service=WMS&version=1.3.0',{
            //        layers: 'kadastralekaart,Perceel',         
                maxZoom:19
            }).addTo(mymap);

            //load json
            let request = new XMLHttpRequest();
            request.open("GET", cottageData,false);
            request.send(null);
            let stateDataJson = JSON.parse(request.responseText);
            var geojson;      


            //generate GeoJson
            var jsonD = {
                type: "FeatureCollection",
                features: []
            }
            
            for(var i = 0; i<windowContext.cottages.length; i++){
                for(var j = 0; j<stateDataJson.features.length; j++){
                    if(windowContext.cottages[i].Polygon_Id__c === stateDataJson.features[j].id){
                        stateDataJson.features[j].properties.availability = windowContext.cottages[i].Map_Status__c
                        jsonD.features.push(stateDataJson.features[j]);
                    }
                }
            }


            geojson = L.geoJson(jsonD, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(mymap);


            //color action: change this based on availability
            function getColor(d) {
                return  d === "Available" ? '#28b602' :
                        d === "Sold" ? '#ff1e00' :
                                        '#FFFFFF' ;
            }
            
            //style action
            function style(feature) {
                return {
                    fillColor: getColor(feature.properties.availability),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5
                };
            }

            function highlightFeature(e) {
                var layer = e.target;
            
                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
            
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
            }

            function resetHighlight(e) {
                geojson.resetStyle(e.target);
            }
            
            function openMapModal(e) {
                windowContext.idToSelectedCottage(e.target.feature.id,windowContext);
                windowContext.isModalOpen = true;
                windowContext.stepNr = 1;

            }
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: openMapModal
                });
            }
        })
        .catch(error => {
            windowContext.error = error;
        })
        .finally(()=>{
            windowContext.mapLoaded=true;
        })
    }

    idToSelectedCottage(id, windowContext){
        console.log('idToSelectedCottage...id='+id);
        for(var i = 0; i < windowContext.cottages.length; i++){
            console.log('[i]='+i);
            if(windowContext.cottages[i].Polygon_Id__c==id){
                windowContext.selectedCottage = windowContext.cottages[i];
                return;
            }
        }
    }

    //modal
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
        //this.initLeaflet(this);
    }

    //new feb26
    goBack() {
        this.stepNr--;
    }

    goNext() {
        this.stepNr++;
    }
    handleSubmit(event){
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Created_by_LWC_Map__c = true; // modify a field
        fields.Reserved_Cottage_Id__c = this.selectedCottage.Id;
        fields.Lead_Type__c = "Private Customer";
        fields.Preferred_Language__c = "Dutch";
        fields.Company = "CPV";

        this.template.querySelector('lightning-record-edit-form').submit(fields);

        this.goNext();
        
        setTimeout(() => {
            this.initLeaflet(this);
        }, 2000);
    }

    parkInfo(){
        /*
        if(this.parkSelectionLocation == this.parkEemhof){
            window.open("http://google.com");
        }else{*/
            window.open("https://www.centerparcs-vastgoed.nl/limburgse-peel");
        //}
    }

    get stepOne(){return this.stepNr == 1};
    get stepTwo(){return this.stepNr == 2};
    get stepThree(){return this.stepNr == 3};

    get cottageAvailable(){
        return this.selectedCottage.Map_Status__c == 'Available';
    }

    get cottageSold(){
        return this.selectedCottage.Map_Status__c == 'Sold';
    }
}