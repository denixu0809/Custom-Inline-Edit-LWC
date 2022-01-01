@isTest
public class CustomLookupLwcControllerTest {
    public static testmethod void testCustomLookupLwcController(){
        String sObjectApiName = 'Account';
        Account accountRec = new Account();
        accountRec.Name = 'Test';
        insert accountRec;
        
        String recordId = accountRec.Id;
        String searchKey = accountRec.Name;
        String nameField = CustomLookupLwcController.getNameField(sObjectApiName);
        String includeQueueOfthisObject = 'Case';
        CustomLookupLwcController.fetchDefaultRecord(recordId);
        CustomLookupLwcController.fetchLookupData(searchKey, sObjectApiName,nameField,includeQueueOfthisObject);
    }
}