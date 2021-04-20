public without sharing class HeatMapStream {
    @AuraEnabled(Cacheable=true)
    public static Cottage__c[] getCottages(double priceMin, double priceMax){
        return [SELECT Id,
                    Name,
                    Map_Status__c,
                    Polygon_Id__c,
                    Of_Persons__c, 
                    Floor_Space_m2__c,
                    Ground_Surface_m2__c,
                    Total_Price_excl_Discount__c 
            FROM Cottage__c
            WHERE Total_Price_excl_Discount__c >= :priceMin
            AND Total_Price_excl_Discount__c <= :priceMax];
    }

    @AuraEnabled(Cacheable=true)
    public static Lead[] getLeads(){
        return [SELECT Id FROM Lead ORDER BY CreatedDate desc LIMIT 1];
    }
}
