import { LightningElement, api ,track} from 'lwc';

export default class CustomDataTableCell_textarea extends LightningElement {

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
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue': event.target.value};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}