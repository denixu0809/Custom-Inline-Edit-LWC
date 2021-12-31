public class CustomLookupLwcController {
   // Method to fetch lookup search result   
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName, String nameField) {    
        List < sObject > returnList = new List < sObject > ();
        string sWildCardText = '%' + searchKey + '%';
        string query ='Select Id,'+nameField+' From ' + sObjectApiName + ' Where '+nameField+' Like : sWildCardText order by createdDate DESC LIMIT 5';
        for (sObject obj: database.query(query)) {
            returnList.add(obj);
        }
        return returnList;
    }
    
    // Method to fetch lookup default value 
    @AuraEnabled
    public static sObject fetchDefaultRecord(string recordId , string sObjectApiName ,String nameField) {
        string sRecId = recordId;    
        string sQuery = 'Select Id,'+nameField+' From ' + sObjectApiName + ' Where Id = : sRecId LIMIT 1';
        for (sObject obj: database.query(sQuery)) {
            return obj;
        }
        return null;
    }
    
    @AuraEnabled(Cacheable=true)
    public static string getNameField(String objectAPIName){
        Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map <String, Schema.SObjectField> fieldMap = schemaMap.get(objectAPIName).getDescribe().fields.getMap();
        for(String field :fieldMap.keyset()){
            if(fieldMap.get(field).getDescribe().isNameField()){
                return fieldMap.get(field).getDescribe().getName();
            }
        }
        return null;
    }
}