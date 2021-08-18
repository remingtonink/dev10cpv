public without sharing class PropertyAppController {
    @AuraEnabled
    //public static Cottage__c[] getCottages(double priceMin, double priceMax, string[] cottageTypes, integer[] nrOfPeople){
    public static Cottage__c[] getCottages(Map<String,Object> data){

        //extract data
        List<String> cottageTypes = (List<String>) JSON.deserialize(
            JSON.serialize(data.get('cottageTypes')),
            List<String>.class
        );
        List<String> nrOfPeople = (List<String>) JSON.deserialize(
            JSON.serialize(data.get('nrOfPeople')),
            List<String>.class
        );
        Double priceMin = (Double) JSON.deserialize(
            JSON.serialize(data.get('priceMin')),
            Double.class
        );
        Double priceMax = (Double) JSON.deserialize(
            JSON.serialize(data.get('priceMax')),
            Double.class
        );

        System.debug(cottageTypes);
        System.debug(nrOfPeople);
        System.debug(priceMin);
        System.debug(priceMax);

        //build string

        string queryString = 'SELECT Id, Name, Map_Status__c,Polygon_Id__c,Of_Persons__c, Floor_Space_m2__c,Ground_Surface_m2__c,Total_Price_excl_Discount__c,CottageType__c FROM Cottage__c';
        queryString += ' WHERE Total_Price_excl_Discount__c>='+(priceMin == null ? 0 : priceMin); // default filter
        
        if(priceMax!=null){
            queryString += ' AND Total_Price_excl_Discount__c<='+priceMax;
        }
        
        if(cottageTypes.size()>0){
            queryString += ' AND CottageType__c in (';
            boolean addComma = false;
            for(string s : cottageTypes){
                if(addComma){
                    queryString += ',';
                }else{
                    addComma = true;
                }
                queryString += '\''+s+'\'';
            }
            queryString += ')';
        }
        
        if(nrOfPeople.size()>0){
            queryString += ' AND Of_Persons__c in (';
            boolean addComma = false;
            for(string s : nrOfPeople){
                if(addComma){
                    queryString += ',';
                }else{
                    addComma = true;
                }
                queryString += '\''+s+'\'';
            }
            queryString += ')';    
        }
/*
        return [SELECT Id,
                    Name,
                    Map_Status__c,
                    Polygon_Id__c,
                    Of_Persons__c, 
                    Floor_Space_m2__c,
                    Ground_Surface_m2__c,
                    Total_Price_excl_Discount__c,
                    CottageType__c
            FROM Cottage__c
            WHERE Total_Price_excl_Discount__c >= :priceMin
            AND Total_Price_excl_Discount__c <= :priceMax
            AND CottageType__c in :cottageTypes
            AND Of_Persons__c in :nrOfPeople];*/

            system.debug('queryString: '+queryString);
            return Database.query(queryString);
    }
}