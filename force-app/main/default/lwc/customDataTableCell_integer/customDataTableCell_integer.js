import { LightningElement, api ,track} from 'lwc';
export default class CustomDataTableCell_integer extends LightningElement {
    @api cellValue;
    @api cellName;
    @api index;
    @api isReadOnly = false;

    @track isEditMode = false;
    @track isTextChange = false;

    onEditHandler(){
        this.isEditMode = true;
    }
    handleOnFocusOut(){this.isEditMode = false}


    onChangeHandler(event){
        this.isTextChange = true;
        var dataValue;
        if(event.target.value == undefined){
            dataValue = null;
        }else{
            dataValue = event.target.value
        }
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue': dataValue};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}