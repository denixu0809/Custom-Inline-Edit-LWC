import { LightningElement, api ,track} from 'lwc';

export default class CustomDataTableCell_lookup extends LightningElement {
    @api rowMetaData;
    @api cellValue;
    @api cellName;
    @api cellValueLabel;
    @api objectName;
    @api lookupCellName;
    @api index;
    @api isReadOnly = false;

    @track isEditMode = false;
    @track isTextChange = false;

    get queuesObjectName(){
        if(this.rowMetaData != undefined){
            return this.rowMetaData.objectName;
        }
        return null;
    } 

    get iconName(){
        if(this.rowMetaData != undefined && this.rowMetaData.lookupObjectName != undefined && !this.rowMetaData.lookupObjectName.includes('__c')){
            return ('standard:'+ this.rowMetaData.lookupObjectName).toLocaleLowerCase();
        }
        return null;
    }

    get relatedTo(){
        return this.rowMetaData.relatedTo;
    }

    get recordLink(){
        return '/'+this.cellValue;
    }

    get hoverCursor(){
        if(this.cellValueLabel != undefined){
            return '--hover-cursor: pointer'
        }
        return '--hover-cursor: auto'
    }

    get fieldReference(){
        return this.rowMetaData.fieldReference;
    }

    redirectToRecord(){
        if(this.cellValue != undefined){
            window.open(this.recordLink,"_blank");
        }
    }

    onEditHandler(){
        this.isEditMode = true;
    }
    handleOnFocusOut(){this.isEditMode = false}

    lookupRecord(event){
        this.isEditMode = false;
        var payload;
        if(event.detail.selectedRecord != undefined){
            payload = JSON.parse(JSON.stringify(event.detail.selectedRecord));
        }
        var selectedId = null;
        var cellValueLabel = null;

        if(payload != undefined){
            selectedId = payload.Id;
            cellValueLabel = payload.Name;
        }

        var eventPayload = {'cellType':'lookup', 'index' :this.index,'cellName':this.cellName,'cellValue': selectedId,'cellValueLabel': cellValueLabel, 'lookupCellName': this.lookupCellName,objectAPIName : this.objectName,'fieldReference' : this.fieldReference};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(eventPayload)
          });
          this.dispatchEvent(selectedEvent);
    }

    onChangeHandler(event){
        this.isTextChange = true;
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue': event.target.value};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}