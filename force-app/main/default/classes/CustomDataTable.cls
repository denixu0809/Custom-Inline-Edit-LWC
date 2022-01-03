public class CustomDataTable {
    @AuraEnabled(Cacheable=true)
    public static List<fieldWrap> getObjectMetaData(String objectAPIName, List<String> fields){
        Map<String,fieldWrap> fieldWrapMap = new Map<String,fieldWrap>();
        Map <String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        
        if(schemaMap.containsKey(objectAPIName)){
            //Get Object Fields
            String currencyCode = UserInfo.getDefaultCurrency();
            Map <String, Schema.SObjectField> fieldMap = schemaMap.get(objectAPIName).getDescribe().fields.getMap();
            List<Schema.SObjectField> picklistFields = new List<Schema.SObjectField>();
            List<String> fieldList = new List<String>();
            for(String field :fields){
                String fieldTemp = field;
                Boolean isRunAgain = false;
                do{
                    isRunAgain = false;
                    if(fieldMap.containsKey(fieldTemp)){
                        Schema.SObjectField sfield = fieldMap.get(fieldTemp);
                        schema.describefieldresult dfield = sfield.getDescribe();
                        if(String.valueOf(dfield.getType()) == 'PICKLIST'){
                            ControllerFieldWrap controllerField = getDependentPicklistValues(sfield);
                            if(controllerField?.controllerFieldName != null && !fields.contains(controllerField?.controllerFieldName)  && !fieldList.contains(controllerField?.controllerFieldName)){
                                fieldList.add(controllerField.controllerFieldName);
                                fieldTemp = controllerField.controllerFieldName;
                                isRunAgain = true;
                            }
                        }
                    }
                }while(isRunAgain);
            }
             
            fields.addAll(fieldList);
            for(String field :fields){
                if(fieldMap.containsKey(field)){
                    Schema.SObjectField sfield = fieldMap.get(field);
                    schema.describefieldresult dfield = sfield.getDescribe();
                    fieldWrap fieldWrapRec = new fieldWrap();
                    fieldWrapRec.objectName = objectAPIName;
                    fieldWrapRec.fieldName = dfield.getname();
                    if(fieldList.contains(fieldWrapRec.fieldName)){
                        fieldWrapRec.isHidden = true;
                    }
                    fieldWrapRec.fieldLabel = dfield.getLabel();
                    fieldWrapRec.fieldType = String.valueOf(dfield.getType());
                    if(fieldWrapRec.fieldType == 'CURRENCY'){
                        fieldWrapRec.currencyCode = currencyCode;
                    }else if(fieldWrapRec.fieldType == 'REFERENCE'){
                        fieldWrapRec.relatedTo = new List<RelatedTo>();
                        String fieldReference;
                        if(fieldWrapRec.fieldName.endsWith('Id')){
                            fieldReference = fieldWrapRec.fieldName.substring(0,fieldWrapRec.fieldName.length() - 2);
                        }else if(fieldWrapRec.fieldName.contains('__c')){
                            fieldReference = fieldWrapRec.fieldName.replace('__c','__r');
                        }
                        fieldWrapRec.fieldReference = fieldReference;
                        for(Schema.SObjectType reference : dfield.getReferenceTo()) {
                            RelatedTo  relatedToRec = new RelatedTo();
                            fieldWrapRec.lookupObjectName = reference.getDescribe().getName();
                            fieldWrapRec.lookupObjectLabel  = reference.getDescribe().getLabel();
                            relatedToRec.lookupObjectName = reference.getDescribe().getName();
                            relatedToRec.lookupObjectLabel  = reference.getDescribe().getLabel();
                            Map <String, Schema.SObjectField> lookupObjectFieldMap = schemaMap.get(relatedToRec.lookupObjectName).getDescribe().fields.getMap();
    						for(String lookupObjectField :lookupObjectFieldMap.keyset()){
                                if(lookupObjectFieldMap.get(lookupObjectField).getDescribe().isNameField()){
                                    fieldWrapRec.lookupNameField = lookupObjectFieldMap.get(lookupObjectField).getDescribe().getName();
                                    fieldWrapRec.lookupFieldRef = fieldWrapRec.fieldReference +'.'+fieldWrapRec.lookupNameField;
                                    relatedToRec.lookupNameField = lookupObjectFieldMap.get(lookupObjectField).getDescribe().getName();
                                    relatedToRec.lookupFieldRef = fieldWrapRec.fieldReference +'.'+relatedToRec.lookupNameField;
                                    fieldWrapRec.RelatedTo.add(relatedToRec);
                                    break;
                                }
                            }
                        }
                    }else if(fieldWrapRec.fieldType == 'PICKLIST'){
                        List<OptionWrap> options = new List<OptionWrap>();
                        for (Schema.PicklistEntry objPickList : dfield.getPickListValues()) {
                            OptionWrap option = new OptionWrap();
                            option.label = objPickList.getLabel();
                            option.value = objPickList.getValue();
                            options.add(option);
                        }      
                        fieldWrapRec.options = options;
                        //get dependency
                        ControllerFieldWrap controllerField = getDependentPicklistValues(sfield);
                        fieldWrapRec.controllerField = controllerField;
                        
                    }
                    fieldWrapRec.isReadOnly = !dfield.isUpdateable();
                    fieldWrapRec.isSortable = dfield.isSortable();
                    fieldWrapMap.put(fieldWrapRec.fieldName,fieldWrapRec);
                }
            }
        }else{
            //incorrect object api name
        }
        System.debug('fieldWrapMap :: '+JSON.serialize(fieldWrapMap));
        return fieldWrapMap.values();
    } 
    
    //Pass dependent field parameter e.g.: Account.YourDependentField__c
    public static ControllerFieldWrap getDependentPicklistValues(Schema.sObjectField dependentField){
        ControllerFieldWrap controllerFieldRec = new ControllerFieldWrap();
        Map<String,List<OptionWrap>> dependentPicklistValues = new Map<String,List<OptionWrap>>();
        //Get dependent field result
        Schema.DescribeFieldResult dependentFieldResult = dependentField.getDescribe();
        //Get dependent field controlling field 
        Schema.sObjectField controllerField = dependentFieldResult.getController();
        //Check controlling field is not null
        if(controllerField == null){
            return null;
        } 
        //Get controlling field result
        Schema.DescribeFieldResult controllerFieldResult = controllerField.getDescribe();
        //Get controlling field picklist values if controlling field is not a checkbox
        List<Schema.PicklistEntry> controllerValues = (controllerFieldResult.getType() == Schema.DisplayType.Boolean ? null : controllerFieldResult.getPicklistValues());
        
        //It is used to decode the characters of the validFor fields. 
        String base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        
        for (Schema.PicklistEntry entry : dependentFieldResult.getPicklistValues()){
            if (entry.isActive()){
                //The PicklistEntry is serialized and deserialized using the Apex JSON class and it will check to have a 'validFor' field
                List<String> base64chars = String.valueOf(((Map<String,Object>)JSON.deserializeUntyped(JSON.serialize(entry))).get('validFor')).split('');
                for (Integer i = 0; i < controllerValues.size(); i++){
                    Object controllerValue = (controllerValues == null ? (Object) (i == 1) : (Object) (controllerValues[i].isActive() ? controllerValues[i].getLabel() : null));
                    Integer bitIndex = i / 6;
                    Integer bitShift = 5 - Math.mod(i, 6 );
                    if(controllerValue == null || (base64map.indexOf(base64chars[bitIndex]) & (1 << bitShift)) == 0){
                        continue;
                    } 
                    if (!dependentPicklistValues.containsKey(String.valueOf(controllerValue))){
                        dependentPicklistValues.put(String.valueOf(controllerValue), new List<OptionWrap>());
                    }
                    OptionWrap optionRec = new OptionWrap();
                    optionRec.label = entry.getLabel();
                    optionRec.value = entry.getValue();
                    dependentPicklistValues.get(String.valueOf(controllerValue)).add(optionRec);
                }
            }
        }
        controllerFieldRec.dependentFieldName = dependentField.getDescribe().getName();
        controllerFieldRec.controllerFieldName = controllerFieldResult.getName();
        controllerFieldRec.dependentValue = dependentPicklistValues;
        return controllerFieldRec;
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<sObject> getRecords(String objectAPIName, List<String> fields, String orderBy, String orderDirection,String filters,String noOfRefresh){
        String query = 'Select ';
        if(!fields.contains('Id')){
            if(fields == null){
                fields = new List<String>();
            }
            fields.add('Id');
        }
        List<String> queryFields = new List<String>();
        for(String field :fields){
            if(field != null && !queryFields.contains(field.toLowerCase())){
                queryFields.add(field.toLowerCase());
            }
        }
        query += String.join(queryFields,',');
        query += ' FROM ' + objectAPIName;
        List<String> filterList = new List<String>();
        if(filters != null){
            for(String filter : filters.split(',')){
                filterList.add(filter.trim());
            }
        }
        if(filterList.size()>0){
            query += ' Where '+ String.join(filterList, ' and ');
        }
        if(orderBy != null && orderDirection != null){
            query += ' Order By '+orderBy+' '+orderDirection+ ' NULLS LAST';
        }
        System.debug('query :: '+query);
        return Database.query(query);
    }
    
    @AuraEnabled
    public static void saveRecords(List<SObject> records){
        Update records;
    }
    
    public class fieldWrap{
        @AuraEnabled public Boolean isHidden = false;
        @AuraEnabled public String objectName;
        @AuraEnabled public String fieldName;
        @AuraEnabled public String fieldType;
        @AuraEnabled public String fieldLabel;
        @AuraEnabled public String currencyCode;
        @AuraEnabled public Boolean isReadOnly;
        @AuraEnabled public Boolean isSortable;
        @AuraEnabled public String fieldReference;
        @AuraEnabled public String lookupObjectLabel;
        @AuraEnabled public String lookupNameField;
        @AuraEnabled public String lookupObjectName;
        @AuraEnabled public String lookupFieldRef;
        @AuraEnabled public List<RelatedTo> relatedTo;
        @AuraEnabled public List<OptionWrap> options;
        @AuraEnabled public ControllerFieldWrap controllerField;
    }
    
    public class RelatedTo{
        @AuraEnabled public String lookupObjectLabel;
        @AuraEnabled public String lookupNameField;
        @AuraEnabled public String lookupObjectName;
        @AuraEnabled public String lookupFieldRef;
    }
    
    public class OptionWrap{
        @AuraEnabled public String label;
        @AuraEnabled public String value;
    }
    public class ControllerFieldWrap{
        @AuraEnabled public String dependentFieldName;
        @AuraEnabled public String controllerFieldName;
        @AuraEnabled public Map<String,List<OptionWrap>> dependentValue;
    }
}