import { LightningElement, api} from 'lwc';
export default class CustomDataTableRow extends LightningElement {
    @api fieldsMetaData;
    @api row;
    @api index;
    @api selectedIds; 

    get isSelected(){
        if(this.selectedIds.includes(this.row.Id)){
            return true;
        }
        return false;
    }

    get recordLink(){
        return '/'+this.row.Id;
    }

    onRecordSelectHandler(event){
        var payload = {Id:this.row.Id,checked:event.target.checked};
        const selectedEvent = new CustomEvent("recordselect",{detail : JSON.stringify(payload)});
        this.dispatchEvent(selectedEvent);

    }

    handleCellChange(event){
        const selectedEvent = new CustomEvent("cellchange",{detail : event.detail});
        this.dispatchEvent(selectedEvent);
    }

}