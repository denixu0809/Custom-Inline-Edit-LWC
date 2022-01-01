declare module "@salesforce/apex/CustomLookupLwcController.fetchLookupData" {
  export default function fetchLookupData(param: {searchKey: any, sObjectApiName: any, nameField: any, includeQueueOfthisObject: any}): Promise<any>;
}
declare module "@salesforce/apex/CustomLookupLwcController.fetchDefaultRecord" {
  export default function fetchDefaultRecord(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/CustomLookupLwcController.getNameField" {
  export default function getNameField(param: {objectAPIName: any}): Promise<any>;
}
