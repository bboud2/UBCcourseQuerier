/**
 * Created by Ben on 11/20/2016.
 */

export default class UIHelpers {

    public static convertToWHERE(data: any): any{
        let returnWHEREObject:any = {};

        if(data.condition == "AND" && data.rules.length == 1 ){
            //TODO
        }

        let logicComparator:any = data.condition;
        let operatorArray:any = [];

        for(let i = 0; i < data.rules.length; i++){
            operatorArray.push(UIHelpers.generateSubWHEREObject(data.rules[i]));
        }
        if (data.rules.length == 1) {
            operatorArray.push(UIHelpers.generateSubWHEREObject(data.rules[0]));
        }
        returnWHEREObject[logicComparator] = operatorArray;
        if(data.not == true){
            let returnNOTWHEREObject:any = {};
            returnNOTWHEREObject.NOT = returnWHEREObject;
            return returnNOTWHEREObject;
        }
        else {
            return returnWHEREObject;
        }
    }


    private static generateSubWHEREObject(object:any):any{
        if(object.hasOwnProperty("condition")){  //recursive case
            return UIHelpers.convertToWHERE(object);
        }
        let operatorTitle:string = UIHelpers.convertOperator(object);
        let newObject:any = {};
        let newSubObject:any = {};
        let subObjectValue:any = null;
        switch (object.type) {
            case "double":
                subObjectValue = parseFloat(object.value);
                break;
            case "integer":
                subObjectValue = parseInt(object.value);
                break;
            case "string":
                subObjectValue = object.value;
        }
        newSubObject[object.id] = object.value;
        newObject[operatorTitle] = newSubObject;
        return newObject;
    }


    public static convertOperator(object:any):string{
        if(object.type == "string"){
            if(object.operator == "equal"){
                return "IS";
            }
            else{
                //TODO NOTIS case;
            }
        }
        else{
            switch(object.operator) {
                case "equal":
                    return "EQ";
                case "not_equal":
                    return ""; //TODO NEQ case
                case "less":
                    return "LT";
                case "greater":
                    return "GT";
            }
        }
    }

}