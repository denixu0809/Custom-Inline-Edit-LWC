import { LightningElement, track, api, wire } from 'lwc';
import getObjectMetaData from '@salesforce/apex/CustomDataTable.getObjectMetaData';
import getRecords from '@salesforce/apex/CustomDataTable.getRecords';
import saveRecords from '@salesforce/apex/CustomDataTable.saveRecords';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class CustomDataTable extends LightningElement {
    @api title;
    @api objectApiName;
    @api fields;
    @api filters;
    @api sortableFields;
    @api readOnlyFields;


    fieldList = [];
    @track selectedRecordIds = [];
    noOfRefresh = 0;
    @track fieldsMetaData = [];
    @track data = [];
    @track dataBulk = [];
    @track isUpdate = false;
    @track orderBy = null;
    @track orderDirection = null;
    showRecords = '10';
    @track currentPage = 1;



    connectedCallback() {
        //initial assignment
        this.fieldList = this.getList(this.fields);
    }  

    get sortableFieldList(){
        return this.getList(this.sortableFields);
    }

    get readOnlyFieldList(){
        return this.getList(this.readOnlyFields);
    }

    getList(payload){
        var list = [];
        if(payload != undefined && payload.length>0){
            (payload.split(',')).forEach(field => {
                 if (field!= undefined && field.trim() != '' && !list.includes(field.trim())) {
                    list.push(field.trim());
                }
            });
        }
        return list;
    }

    get totalRecords(){
        return this.dataBulk.length;
    }

    get totalPages(){
        var totalPage = 0;
        if(this.totalRecords != undefined && this.showRecords!=undefined){
            totalPage = parseInt(this.totalRecords/parseInt(this.showRecords));
            totalPage+=1;
        }
        return totalPage;
    }

    get showRecordsOption(){
        var options = [];
        if(this.totalRecords >=10){options.push({label:'10',value:'10'});}
        if(this.totalRecords >=25){options.push({label:'25',value:'25'});}
        if(this.totalRecords >=50){options.push({label:'50',value:'50'});}
        if(this.totalRecords >=75){options.push({label:'75',value:'75'});}
        return options;
    } 

    showNoOfRecordHandler(event){
        this.showRecords = event.target.value;
        this.currentPage = 1;
        this.getPagination();
    }

    onPageNoChangeHandler(event){
        var currentPage = event.target.value;
        if(currentPage <= this.totalPages){
            this.currentPage = currentPage;
            this.getPagination();
        }else{
            event.target.value = this.currentPage;
            this.showToast('Info','Info','Please select valid page number');
        }
        
    }

    handleSortColumn(event){
        this.orderBy = event.detail;
        this.orderDirection = this.orderDirection == 'asc'?'desc':'asc';
        refreshApex(this.wiredData);
    }

    get isDisabledNextPage(){
        if(this.currentPage<this.totalPages){
            return false;
        }
        return true;
    }
 
    get isDisabledPreviousPage(){
        if(this.currentPage>1){
            return false;
        }
        return true;
    }

    onPreviousPage(){
        this.currentPage = parseInt(this.currentPage) - 1;
        this.getPagination();
    }
    onNextPage(){
        this.currentPage = parseInt(this.currentPage) + 1;
        this.getPagination();
    }

    @wire(getObjectMetaData, { objectAPIName: '$objectApiName', fields: '$fieldList' })
    wiredObjectMetaData({ error, data }) {
        if (data) {
            var fieldsMetaData = [];
            data.forEach(currentItem => {
                var fieldMetaData = JSON.parse(JSON.stringify(currentItem));
                if(!this.sortableFieldList.includes(fieldMetaData.fieldName)){
                     if(fieldMetaData.isSortable){
                         fieldMetaData.isSortable = false;
                     }
                }

                if(this.readOnlyFieldList.includes(fieldMetaData.fieldName)){
                    fieldMetaData.isReadOnly = true;
                }
                fieldsMetaData.push(fieldMetaData);
            });
            this.fieldsMetaData = fieldsMetaData;
        } else if (error) {
            this.showToast('Error','Error',this.handle(error));
            console.error('Error:', error);
        }
    }

    get queryFieldList() {
        var fields = [];
        if (this.fieldsMetaData != undefined) {
            this.fieldsMetaData.forEach(field => {
                if (!fields.includes(field.fieldName)) {
                    fields.push(field.fieldName);
                    if (field.lookupFieldRef != undefined) {
                        fields.push(field.lookupFieldRef);
                    }
                }
            });
        }
        return fields;
    }

    @wire(getRecords, { objectAPIName: '$objectApiName', fields: '$queryFieldList', orderBy : '$orderBy' , orderDirection : '$orderDirection', filters : '$filters', noOfRefresh : '$noOfRefresh'})
    wiredData ({ error, data }) {
        if (data) {
            this.dataBulk = JSON.parse(JSON.stringify(data));
            this.getPagination();
        } else if (error) {
            this.showToast('Error','Error',this.handle(error));
            console.error('Error:', error);
        }
    }

    //Select Records
    onRecordSelectHandler(event){
        var payload = JSON.parse(event.detail);
        var selectedRecordIds = [];
        if(payload.Id != undefined && payload.checked != undefined){
            if(this.selectedRecordIds != undefined){
                selectedRecordIds = JSON.parse(JSON.stringify(this.selectedRecordIds));
            }
            if(payload.checked){
                if(!selectedRecordIds.includes(payload.Id)){
                    selectedRecordIds.push(payload.Id);
                }
            }else{
                if(selectedRecordIds.includes(payload.Id)){
                    const index = selectedRecordIds.indexOf(payload.Id);
                    selectedRecordIds.splice(index, 1);
                }
            }
        }
        this.selectedRecordIds = selectedRecordIds;
    }

    getPagination(){
        refreshApex(this.wiredData);
        var currentPage = this.currentPage;
        var showRecords = this.showRecords;
        var startIndex = (parseInt(currentPage) -1 ) * parseInt(showRecords);
        var endIndex = parseInt(startIndex) + parseInt(showRecords);
        endIndex = endIndex > this.totalRecords? this.totalRecords:endIndex;
        this.data = this.dataBulk.slice(startIndex,endIndex);
        this.isUpdate = false;
        this.selectedRecordIds = [];

    }

    onCancelHandler(){
        this.isUpdate = false;
        this.getPagination();
    }

    handleCellChange(event) {
        var payload = JSON.parse(event.detail);
        var data = JSON.parse(JSON.stringify(this.data));
        data[payload.index][payload.cellName] = payload.cellValue;
        this.isUpdate  = true; 

        //dependent picklist start
        if (payload.cellType != undefined && payload.cellType == 'picklist') {
            this.fieldsMetaData.forEach(field => {
                if (field.controllerField != undefined) {
                    const controllerFieldName = field.controllerField.controllerFieldName;
                    const dependentFieldName = field.controllerField.dependentFieldName;
                    const dependentValue = field.controllerField.dependentValue;
                    if (controllerFieldName == payload.cellName && dependentValue != undefined) {
                        var childPickValue = data[payload.index][dependentFieldName];
                        if (payload.cellValue != undefined) {
                            var availablePickValue = [];
                            dependentValue[payload.cellValue].forEach(item => {
                                availablePickValue.push(item.value);
                            });
                            if (!availablePickValue.includes(childPickValue)) {
                                data[payload.index][dependentFieldName] = null;
                            }
                        } else {
                            data[payload.index][dependentFieldName] = null;
                        }
                    }

                }
            });
        }
        //dependent picklist end

        //lookup
        else if (payload.cellType != undefined && payload.cellType == 'lookup') {
            console.log('lookup');
            var lookupField = payload.fieldReference;
            var lookupRow = null;
            if(payload.cellValue != undefined){
                lookupRow = {};
                lookupRow[payload.lookupCellName] = payload.cellValueLabel;
                lookupRow['Id'] = payload.cellValue;
            }
            data[payload.index][lookupField] = lookupRow;
        }

        //selelected records
        if(this.selectedRecordIds != undefined && this.selectedRecordIds.length >0 && this.selectedRecordIds.includes(data[payload.index]['Id'])){
            data.forEach(currentItem => {
                    if(this.selectedRecordIds.includes(currentItem.Id)){
                        currentItem[payload.cellName] = payload.cellValue;

                        //dependent picklist start
                        if (payload.cellType != undefined && payload.cellType == 'picklist') {
                            this.fieldsMetaData.forEach(field => {
                                if (field.controllerField != undefined) {
                                    const controllerFieldName = field.controllerField.controllerFieldName;
                                    const dependentFieldName = field.controllerField.dependentFieldName;
                                    const dependentValue = field.controllerField.dependentValue;
                                    if (controllerFieldName == payload.cellName && dependentValue != undefined) {
                                        var childPickValue = currentItem[dependentFieldName];
                                        if (payload.cellValue != undefined) {
                                            var availablePickValue = [];
                                            dependentValue[payload.cellValue].forEach(item => {
                                                availablePickValue.push(item.value);
                                            });
                                            if (!availablePickValue.includes(childPickValue)) {
                                                currentItem[dependentFieldName] = null;
                                            }
                                        } else {
                                            currentItem[dependentFieldName] = null;
                                        }
                                    }

                                }
                            });
                        }
                        //dependent picklist end

                        //lookup
                        else if (payload.cellType != undefined && payload.cellType == 'lookup') {
                            console.log('lookup');
                            var lookupField = payload.cellName;
                            if (lookupField.includes('__c')) {
                                lookupField = lookupField.replace('__c', '__r');
                            } else if (lookupField.endsWith('Id')) {
                                lookupField = lookupField.substring(0, lookupField.length - 2);
                            }
                            var lookupRow = null;
                            if (payload.cellValue != undefined) {
                                lookupRow = {};
                                lookupRow[payload.lookupCellName] = payload.cellValueLabel;
                                lookupRow['Id'] = payload.cellValue;
                            }
                            currentItem[lookupField] = lookupRow;
                        }
                    }
            });
        }

        this.data = data;
    }

    onSaveHandler(){
        
        saveRecords({'records': this.data})
        .then(result => {
            refreshApex(this.wiredData);
            var message = 'Records updated successfully.';
            this.showToast('Success','Success',message);
            this.noOfRefresh = parseInt(this.noOfRefresh) + 1;
        })
        .catch(error => {
            this.showToast('Error','Error',this.handle(error));
            console.log(error);
        });
        
    }
    showToast(variant, title, message) {
        const event = new ShowToastEvent({
            variant:variant,
            title: title,
            message:message,
        });
        this.dispatchEvent(event);
    }

    handle(error){
        var message = '';
        if(error != undefined && error.body != undefined){
            if (Array.isArray(error.body)) {
               message += error.body.map(e => e.message).join(', ');
            }
            else if(typeof error.body === 'object'){
                let fieldErrors = error.body.fieldErrors;
                let pageErrors = error.body.pageErrors;
                let duplicateResults = error.body.duplicateResults;
                let exceptionError = error.body.message;
 
                if(exceptionError && typeof exceptionError === 'string') {
                    message += exceptionError;
                }
                
                if(fieldErrors){
                    for(var fieldName in fieldErrors){
                        let errorList = fieldErrors[fieldName];
                        for(var i=0; i < errorList.length; i++){
                            message += errorList[i].statusCode + ' ' + fieldName + ' ' + errorList[i].message + ' ';
                        }
                    }
                }
        
                if(pageErrors && pageErrors.length > 0){
                    for(let i=0; i < pageErrors.length; i++){
                        message += pageErrors[i].statusCode + ' '+ pageErrors[i].message;
                    }
                }
        
                if(duplicateResults && duplicateResults.length > 0){
                    message += 'duplicate result error';
                }
            }  
        }
        // handles errors from the lightning record edit form
        if(error.message){
            message += error.message;
        }
        if(error.detail){
            message += error.detail;
        }

        return message;
    }
}