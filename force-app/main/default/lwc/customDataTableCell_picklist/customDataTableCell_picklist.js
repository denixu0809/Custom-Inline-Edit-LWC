import { LightningElement, api ,track} from 'lwc';

export default class CustomDataTableCell_picklist extends LightningElement {

    @api cellValue;
    @api cellName;
    @api index;
    @api options;
    @api isReadOnly = false;

    @track isEditMode = false;
    @track isTextChange = false;

    get picklistOptions(){
        var options =[{label:'-- None --',value:null}];
        if(this.options != undefined){
            options = options.concat(this.options);
        }
        return options;
    }
  
    onEditHandler(){
        this.isEditMode = true;
    }
    handleOnFocusOut(){}


    onChangeHandler(event){
        this.isEditMode = false;
        this.isTextChange = true;
        var payload = {'index' :this.index,'cellName':this.cellName,'cellValue': event.target.value,'cellType' : 'picklist'};
        const selectedEvent = new CustomEvent("datachange", {
            detail: JSON.stringify(payload)
          });
          this.dispatchEvent(selectedEvent);
    }
}