declare module "@salesforce/apex/CustomDataTable.getObjectMetaData" {
  export default function getObjectMetaData(param: {objectAPIName: any, fields: any}): Promise<any>;
}
declare module "@salesforce/apex/CustomDataTable.getRecords" {
  export default function getRecords(param: {objectAPIName: any, fields: any, orderBy: any, orderDirection: any, noOfRefresh: any}): Promise<any>;
}
declare module "@salesforce/apex/CustomDataTable.saveRecords" {
  export default function saveRecords(param: {records: any}): Promise<any>;
}
