import { LightningElement, api } from 'lwc';
export default class CustomLookupLwc_result extends LightningElement {
    @api singleRec;
    @api nameField;
    @api iconName;

    get recName(){
        if(this.singleRec != undefined){
            return this.singleRec[this.nameField];
        }
        return null;
    }


    handelSelectedRecord(){
        const selectedEvent = new CustomEvent("selectrecord", {
            detail: JSON.stringify(this.singleRec)
          });
          this.dispatchEvent(selectedEvent);
    }

}