public class CustomLookupLwcController {
   // Method to fetch lookup search result   
    @AuraEnabled(cacheable=true)
    public static list<LookupResult> fetchLookupData(string searchKey , string sObjectApiName, String nameField, String includeQueueOfthisObject) {    
        List < LookupResult > returnList = new List < LookupResult > ();
        string sWildCardText = '%' + searchKey + '%';
        string query ='Select Id,'+nameField+' From ' + sObjectApiName + ' Where '+nameField+' Like : sWildCardText order by createdDate DESC LIMIT 5';
        for (sObject obj: database.query(query)) {
            LookupResult lookupResultRec = new LookupResult();
            lookupResultRec.Id = String.valueOf(obj.get('Id'));
            lookupResultRec.Name = String.valueOf(obj.get(nameField));
            returnList.add(lookupResultRec);
        }
        if(includeQueueOfthisObject != null){
            for(QueueSobject obj: [SELECT Id, QueueId, Queue.Name, SobjectType FROM QueueSobject Where SobjectType =:includeQueueOfthisObject AND Queue.Name Like :sWildCardText LIMIT 5]){
                LookupResult lookupResultRec = new LookupResult();
                lookupResultRec.Id = obj.QueueId;
                lookupResultRec.Name = obj.Queue.Name;
                returnList.add(lookupResultRec);
            }
        }
        return returnList;
    }
    
    // Method to fetch lookup default value 
    @AuraEnabled
    public static LookupResult fetchDefaultRecord(string recordId) {
        string sRecId = recordId;    
        if(recordId != null){
            String sObjectApiName = Id.valueOf(sRecId).getsobjecttype().getDescribe().getName();
            String nameField = getNameField(sObjectApiName);
            string sQuery = 'Select Id,'+nameField+' From ' + sObjectApiName + ' Where Id = : sRecId LIMIT 1';
            for (sObject obj: database.query(sQuery)) {
				LookupResult lookupResultRec = new LookupResult();        
                lookupResultRec.Id = String.valueOf(obj.get('Id'));
                lookupResultRec.Name = String.valueOf(obj.get(nameField));
                return lookupResultRec;
            }
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
    
    public class LookupResult{
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;
    }
}