import {QueryRequest} from "../../controller/QueryController";
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

            if(data.rules[i].hasOwnProperty("condition")){  //recursive case
                //returnWHEREObject
                //TODO
            }
            let operatorTitle:string = UIHelpers.convertOperator(data.rules[i]);
            let newObject:any = {};
            let newSubObject:any = {};
            newSubObject[data.rules[i].id] = data.rules[i].value;
            newObject[operatorTitle] = newSubObject;
            operatorArray.push(newObject);
        }

        returnWHEREObject[logicComparator] = operatorArray;
        return returnWHEREObject;
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