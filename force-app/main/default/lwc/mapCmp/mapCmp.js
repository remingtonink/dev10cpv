import { LightningElement,api } from 'lwc';
import { loadStyle, loadScript} from 'lightning/platformResourceLoader';
import leafletjs from '@salesforce/resourceUrl/leaflet';
import cottageData from '@salesforce/resourceUrl/cottageData';

export default class MapCmp extends LightningElement {

    @api error;
    cottages;
    mapLoaded = false;
    renderedMap;

    @api 
    get stones(){
        return this.cottages;
    };
    set stones(value){      
        this.cottages = value;
        if(!this.mapLoaded){
            Promise.all([
                loadScript(this, leafletjs+'/leaflet.js'),
                loadStyle(this, leafletjs+'/leaflet.css'),
            ])
            .then(() => {            
                this.initLeaflet(this);         
            })
            .catch(error => {
                console.log('Leaflet promise return failed: '+error);
            })
        }else{
            this.initLeaflet(this);
        }

    }
    
    initLeaflet(windowContext){
        const heatMap = this.template.querySelector(".map-root");

        if(windowContext.renderedMap){
            windowContext.renderedMap.remove();
        }

        var mymap = L.map(heatMap,{tap:false}).setView([51.449213, 5.964885], 18);
        if(mymap){
            windowContext.renderedMap = mymap;
        }
                
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{    
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

        windowContext.mapLoaded = true;


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
            console.log('Click!');
            console.log(e.target.feature.id);
            windowContext.dispatchEvent(new CustomEvent('cottageselect',{detail:e.target.feature.id,windowContext}));

        }
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: openMapModal
            });
        }
    }
}