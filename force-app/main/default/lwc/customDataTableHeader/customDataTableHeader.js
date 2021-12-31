import { LightningElement, api } from 'lwc';
export default class CustomDataTableHeader extends LightningElement {
    @api header;
    @api orderBy;
    @api orderDirection;

    get sortByThisHeader() {
        if (this.orderByFieldName == this.orderBy) {
            return true;
        }
        return false;
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

    sortColumHandler(event) {
        if (this.header.isSortable) {
            const selectedEvent = new CustomEvent("sortcolumn", {
                detail: this.orderByFieldName
            });
            this.dispatchEvent(selectedEvent);
        }
    }
}