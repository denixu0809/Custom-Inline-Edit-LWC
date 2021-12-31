import { LightningElement, api, track } from 'lwc';
export default class CustomDataTableCell extends LightningElement {
    @api rowMetaData;
    @api row;
    @api index; 
    
    get cellName(){return this.rowMetaData.fieldName;}
    get cellValue(){return this.row[this.cellName];}
    get cellValueName(){return this.rowMetaData.lookupNameField;}
    get objectName(){return this.rowMetaData.lookupObjectName;}
    get cellValueLabel(){
        if(this.cellValueName != undefined && this.cellValue != undefined){
           
            var lookupCellName = this.cellName;
            if (lookupCellName.includes('__c')) {
                lookupCellName = lookupCellName.replace('__c', '__r');
            } else if (lookupCellName.endsWith('Id')) {
                lookupCellName = lookupCellName.substring(0, lookupCellName.length - 2);
            } 
            var row = JSON.parse(JSON.stringify(this.row));
            var lookupRow = JSON.parse(JSON.stringify(row[lookupCellName]));
            return lookupRow[this.cellValueName]; 
        }
        return null;
    }
    get cellType(){return this.rowMetaData.fieldType;}
    get isReadOnly(){return this.rowMetaData.isReadOnly;}
    get options(){
        if(this.rowMetaData.controllerField == undefined){
            return this.rowMetaData.options;
        }else{
            const controllerFieldName = this.rowMetaData.controllerField.controllerFieldName;
            const dependentValue = this.rowMetaData.controllerField.dependentValue;
            if(controllerFieldName != undefined && dependentValue != undefined){
                var parentValue = this.row[controllerFieldName];
                if(parentValue != undefined){
                    return dependentValue[parentValue];
                }
            }
        }
        return [];
    }

    get isString(){return this.cellType == 'STRING';}
    get isNumber(){return this.cellType == 'INTEGER';}
    get isCheckbox(){return this.cellType == 'BOOLEAN';}
    get isDouble(){return this.cellType == 'DOUBLE';}
    get isCurrency(){return this.cellType == 'CURRENCY';}
    get currencyCode(){if(this.isCurrency){return this.rowMetaData.currencyCode;} return null;}
    get isLookup(){return this.cellType == 'REFERENCE';}
    get isDate(){return this.cellType == 'DATE';}
    get isDateTime(){return this.cellType == 'DATETIME';}
    get isURL(){return this.cellType == 'URL';}
    get isPhone(){return this.cellType == 'PHONE';}
    get isTextArea(){return this.cellType == 'TEXTAREA';}
    get isPicklist(){return this.cellType == 'PICKLIST';}
    get isUnknownType() {
        return !(this.isString || this.isNumber || this.isCheckbox || this.isDouble || this.isCurrency || this.isLookup || this.isDate
            || this.isDateTime || this.isURL || this.isPhone || this.isTextArea || this.isPicklist);
    }
    handleCellChange(event){
        const selectedEvent = new CustomEvent("datachange", {detail : event.detail});
        this.dispatchEvent(selectedEvent);
    }
    
}