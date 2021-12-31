import { LightningElement, api ,track} from 'lwc';

export default class CustomDataTableCell_url extends LightningElement {
    
    @api cellValue;
    @api cellName;
    @api index;
    @api isReadOnly = false;

    @track isEditMode = false;
    @track isTextChange = false;
 
    get hoverCursor(){
        if(this.cellValue != undefined){
            return '--hover-cursor: pointer'
        }
        return '--hover-cursor: auto'
    }

    redirectToLink(){
        if(this.cellValue != undefined){
            window.open(this.cellValue,"_blank");
        }
    }

    onEditHandler(){
        this.isEditMode = true;
    }

    handleOnFocusOut(){this.isEditMode = false}


    onChangeHandler(event){
        this.isTextChange = true;
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue':event.target.value};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}