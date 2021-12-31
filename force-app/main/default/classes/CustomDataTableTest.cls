@isTest
public class CustomDataTableTest {
    public static testmethod void testCustomDataTable(){
        String objectAPIName = 'Account';
        List<String> fields = new List<String>();
        Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map <String, Schema.SObjectField> fieldMap = schemaMap.get(objectAPIName).getDescribe().fields.getMap();
        for(String field : fieldMap.keyset()){
            if(!fields.contains(field.toLowerCase())){
                fields.add(field.toLowerCase());
            }
        }
        String orderBy = 'Name';
        String orderDirection = 'ASC';
        String noOfRefresh = '1';
        CustomDataTable.getObjectMetaData(objectAPIName, fields);
        List<sObject> records = CustomDataTable.getRecords(objectAPIName, fields, orderBy, orderDirection, noOfRefresh);
        CustomDataTable.saveRecords(records);
    }
}