@isTest
public class CustomLookupLwcControllerTest {
    public static testmethod void testCustomLookupLwcController(){
        String sObjectApiName = 'Account';
        Account accountRec = new Account();
        accountRec.Name = 'Test';
        insert accountRec;
        
        String recordId = accountRec.Id;
        String searchKey = accountRec.Name;
        CustomLookupLwcController.fetchDefaultRecord(recordId, sObjectApiName);
        CustomLookupLwcController.fetchLookupData(searchKey, sObjectApiName);
    }
}