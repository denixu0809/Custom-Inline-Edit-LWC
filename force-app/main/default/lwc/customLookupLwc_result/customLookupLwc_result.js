import { LightningElement, api } from 'lwc';
export default class CustomLookupLwc_result extends LightningElement {
    @api singleRec;
    @api iconName; 

    get recName(){
        return this.singleRec.Name;
    }


    handelSelectedRecord(){
        const selectedEvent = new CustomEvent("selectrecord", {
            detail: JSON.stringify(this.singleRec)
          });
          this.dispatchEvent(selectedEvent);
    }

}