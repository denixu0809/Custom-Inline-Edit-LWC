import { LightningElement, track, api } from 'lwc';
export default class CustomDataTableHeader extends LightningElement {
    @api header;
    @api orderBy;
    @api orderDirection;

    @track isFilterEnabled = false;
    operator = '=';
    dateOperator = '=';
    isRelativeDate = true;
    isDateRange = false;
    selectedRelativeDate;
    fieldValue;
    fieldValue2;//USED FOR DATE TYPE
    fieldQuery;

    get fieldType(){
        return this.header.fieldType;
    }

    get sortByThisHeader() {
        if (this.orderByFieldName == this.orderBy) {
            return true;
        }
        return false;
    }

    get CheckboxOption(){
         var option = [{ label: 'None', value: '' },
        { label: 'TRUE', value: 'true' },
        { label: 'FALSE', value: 'false' }];
        return option;
    }


    get getOperatorOption() {
        var option = [{ label: 'equals', value: '=' },
        { label: 'not equal to', value: '!=' },
        { label: 'less', value: '<' },
        { label: 'less than or equals', value: '<=' },
        { label: 'greater than', value: '>' },
        { label: 'greater or equals', value: '>=' }];
        return option;
    }

    get relativeDateOption() {
        var option = [{ label: 'TODAY', value: 'TODAY' },
        { label: 'YESTERDAY', value: 'YESTERDAY' },
        { label: 'TOMORROW', value: 'TOMORROW' },
        { label: 'LAST WEEK', value: 'LAST_WEEK' },
        { label: 'THIS WEEK', value: 'THIS_WEEK' },
        { label: 'NEXT WEEK', value: 'NEXT_WEEK' },
        { label: 'LAST MONTH', value: 'LAST_MONTH' },
        { label: 'THIS MONTH', value: 'THIS_MONTH' },
        { label: 'NEXT MONTH', value: 'NEXT_MONTH' },
        { label: 'LAST 90 DAYS', value: 'LAST_90_DAYS' },
        { label: 'NEXT 90 DAYS', value: 'NEXT_90_DAYS' },
        { label: 'LAST QUARTER', value: 'LAST_QUARTER' },
        { label: 'THIS QUARTER', value: 'THIS_QUARTER' },
        { label: 'NEXT QUARTER', value: 'NEXT_QUARTER' },
        { label: 'LAST YEAR', value: 'LAST_YEAR' },
        { label: 'THIS YEAR', value: 'THIS_YEAR' },
        { label: 'NEXT YEAR', value: 'NEXT_YEAR' }];
        return option;
    }

    handleRelativeDateChange(event){
        this.fieldValue = event.target.value;
        this.fireQueryUpdate();
    }

    handleCheckboxChange(event){
        this.fieldValue = event.target.value;
        this.fireQueryUpdate();
    }

    get isTextSearch() {
        if (['STRING', 'REFERENCE', 'PICKLIST'].includes(this.header.fieldType)) { return true; }
        return false;
    }

    get isNumberSearch() {
        if (['INTEGER', 'DOUBLE', 'CURRENCY'].includes(this.header.fieldType)) {
            return true;
        }
        return false;
    }

    get isCheckBox(){
        if(this.header.fieldType == 'BOOLEAN'){
            return true;
        }
        return false;
    }

    get isDateORDateTime(){
        if(['DATE','DATETIME'].includes(this.header.fieldType)){return true;}
        return false;
    }

    filterEnableHandler() {
        this.isFilterEnabled = true;
    }

    get orderByFieldName() {
        var orderBy = this.header.fieldName;
        if (this.header.fieldType == 'REFERENCE') {
            if (orderBy.includes('__c')) {
                orderBy = orderBy.replace('__c', '__r') + '.' + this.header.lookupNameField;
            } else if (orderBy.endsWith('Id')) {
                orderBy = orderBy.substring(0, orderBy.length - 2) + '.' + this.header.lookupNameField;
            }
        }
        return orderBy;
    }

    get iconName() {
        return this.orderDirection == 'asc' ? 'utility:arrowup' : 'utility:arrowdown';
    }

    onRelativeDateHandler(){
        this.isRelativeDate = !this.isRelativeDate;
        this.fieldValue = null;
        this.fieldvalue2 = null;
        this.selectedRelativeDate = 'Today';
        this.fireQueryUpdate();
    }

    onDateRangeHandler(){
        this.isDateRange = !this.isDateRange;
        this.fireQueryUpdate();
    }

    handleDateChange(event){
        var name = event.target.name;
        var selectedDate = event.target.value;
        if(name == "startDate"){
            this.fieldValue = selectedDate;
        }else if(name == "endDate"){
            this.fieldValue2 = selectedDate;
        }
        this.fireQueryUpdate();
    }

    sortColumHandler(event) {
        if (this.header.isSortable) {
            const selectedEvent = new CustomEvent("sortcolumn", {
                detail: this.orderByFieldName
            });
            this.dispatchEvent(selectedEvent);
        }
    }

    handleOperatorChange(event) {
        this.operator = event.target.value;
        this.fireQueryUpdate();
    }

    handleSearch(event) {
        this.fieldValue = event.target.value;
        this.fireQueryUpdate();
    }

    removeFilterHanlder() {
        this.isFilterEnabled = false;
        this.fieldValue = null;
        this.fieldValue2 = null;
        this.fireQueryUpdate();
    }

    fireQueryUpdate() {
        var fieldQuery = null;
        var fieldName = this.orderByFieldName;
        var fieldValue = this.fieldValue;
        var fieldValue2 = this.fieldValue2;
        var operator = this.operator;
        
        if ((fieldValue != undefined && fieldValue != '') || (this.isDateRange && fieldValue2 != undefined && fieldValue2 != '')) {
            if (this.isDateORDateTime) {
                if(this.isRelativeDate){
                    fieldQuery = fieldName + '  = ' + fieldValue + ' ';
                }else if(this.isDateRange){
                    var filters = [];
                    if(fieldValue != undefined && fieldValue != ''){
                        filters.push(fieldName + '  >= ' + fieldValue + ' ');
                    }
                    if((fieldValue2 != undefined && fieldValue2 != '')){
                        filters.push(fieldName + '  <= ' + fieldValue2 + ' ');
                    }
                    fieldQuery = filters.join(',');
                }else{
                    fieldQuery = fieldName + '  = ' + fieldValue + ' ';
                }
            } else if (this.isNumberSearch) {
                fieldQuery = (fieldName + '  ' + operator + ' ' + fieldValue + ' ');

            } else if(this.isTextSearch){
                fieldQuery = (fieldName + ' Like \'%' + fieldValue + '%\'');
            }else if(this.isCheckBox){
                fieldQuery = fieldName +' = '+ fieldValue;
            }
        } 
        const selectedEvent = new CustomEvent("search", {
            detail: { fieldName: this.orderByFieldName, fieldQuery: fieldQuery }
        });
        this.dispatchEvent(selectedEvent);
    }
}