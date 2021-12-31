import { LightningElement, api ,track} from 'lwc'; 

export default class CustomDataTableCell_datetime extends LightningElement {

    @api cellValue;
    @api cellName;
    @api index;
    @api isReadOnly = false;

    @track isEditMode = false;

    onEditHandler(){
        this.isEditMode = true;
    }
    handleOnFocusOut(){}


    onChangeHandler(event){
        this.isEditMode = false;
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue': event.target.value};
        console.log(payload);
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}