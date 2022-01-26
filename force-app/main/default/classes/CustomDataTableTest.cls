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
        String sorting = 'Name ASC';
        String noOfRefresh = '1';
        String filters = 'Name!=null,CreatedDate=Today';
        String additionalFilters = 'CreatedDate!=null';
        CustomDataTable.getObjectMetaData(objectAPIName, fields);
        List<sObject> records = CustomDataTable.getRecords(objectAPIName, fields, sorting,filters,additionalFilters, noOfRefresh);
        CustomDataTable.saveRecords(records);
    }
}