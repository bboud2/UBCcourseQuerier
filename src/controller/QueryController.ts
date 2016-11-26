/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import {Section} from "./DatasetController";
import OperatorHelpers from "./OperatorHelpers";
import fs = require('fs');

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    GROUP?: string[];
    APPLY?: {}[];
    ORDER?: string | sortObject;
    AS: string;
}

export interface sortObject {
    ORDER: orderObject;
}

export interface orderObject {
    dir: string;
    keys: string[];
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    private id: string = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    /**
     Ensures that a specific key in GET is valid such that it either is a valid dataset ID (contains an _) if
     GROUP/ORDER are not present, or it is present in GROUP/ORDER if they are present.

     This method is only used to check keys in GET. It does not ensure that the keys in ORDER or GROUP are valid.
     **/
    private static isValidKey(key: string, groupOrderExists: boolean, query: QueryRequest) {
        if (groupOrderExists) {
            let foundKey: boolean = false;
            if (key.indexOf("_") == -1) {
                for (let i = 0; i < query.APPLY.length; i++) {
                    let currKey: string = Object.keys(query.APPLY[i])[0];
                    if (currKey == key) {
                        foundKey = true;
                        break;
                    }
                }
                if (!foundKey) {
                    throw {ID: 400, MESSAGE: "key: " + key + " was not found in APPLY"};
                }
            } else {
                for (let i = 0; i < query.GROUP.length; i++) {
                    let currKey: string = query.GROUP[i];
                    if (currKey == key) {
                        foundKey = true;
                        break;
                    }
                }
                if (!foundKey) {
                    throw {ID: 400, MESSAGE: "key: " + key + " was not found in GROUP"};
                }
            }
        } else {
            if (key.indexOf("_") == -1) {
                throw  {ID: 400, MESSAGE: "Malformed dataset id: " + key};
            }
        }
    }

    /**
     Checks basic query validity. Ensures that only the correct keys are present in the base query, as well as
     ensures that the keys in GET are correct.
     **/
    public static isValid(query: QueryRequest) {
        let actualKeys: number = Object.keys(query).length;
        let expectedKeys: number = 3;
        let groupApplyStatus: boolean = false;

        if(query.hasOwnProperty("ORDER")) {
            expectedKeys++;
        }
        if(query.hasOwnProperty("GROUP")) {
            expectedKeys++;
            groupApplyStatus = !groupApplyStatus;
        }
        if(query.hasOwnProperty("APPLY")) {
            expectedKeys++;
            groupApplyStatus = !groupApplyStatus;
        }
        if (groupApplyStatus) {
            throw  {ID: 400, MESSAGE: "One of GROUP/APPLY is present without the other GROUP/APPLY"}
        }
        if (actualKeys != expectedKeys) {
            throw  {ID: 400, MESSAGE: (actualKeys - expectedKeys).toString() + " additional key(s) in query (negative number means keys are missing)"}
        }

        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0 &&
            query.hasOwnProperty("GET") && query.hasOwnProperty("WHERE") && query.hasOwnProperty("AS")) {
            let trueGet: any = [];
            if (typeof(query.GET) == "string") {
                trueGet.push(query.GET);
            } else {
                trueGet = query.GET;
            }
            if (trueGet.length == 0) {
                throw  {ID: 400, MESSAGE: "You have to GET something. Queries can't get nothing"};
            }
            for (let i = 0; i < trueGet.length; i++) {
                QueryController.isValidKey(trueGet[i], query.hasOwnProperty("GROUP"), query);
            }
            let oneUnderscore: boolean = false;
            for (let i = 0; i < trueGet.length; i++) {
                let curr_key: string = trueGet[i];
                if (curr_key.indexOf("_") != -1) {
                    oneUnderscore = true;
                    break;
                }
            }
            if (!oneUnderscore) {
                throw  {ID: 400, MESSAGE: "No keys with an underscore so no dataset ID to look for"};
            }
            return true;
        }
        throw {ID: 400, MESSAGE: "Query is invalid"}
    }

    /**
     * Gets all objects in the dataset titled id.
     * @param ids
     * @returns {any[]}
     */
    private getAllObjects(ids: string[]): any[] {
        for (let j = 0; j < ids.length; j++) {
            if (ids[j].indexOf("_") != -1) {
                let id: string = ids[j].substr(0,ids[j].indexOf("_"));
                for (let i = 0; i < this.datasets.sets.length; i++) {
                    if (this.datasets.sets[i].id_key == id) {
                        this.id = id;
                        if (this.datasets.sets[i].hasOwnProperty("sections")) {
                            return this.datasets.sets[i].sections;
                        } else {
                            return this.datasets.sets[i].rooms;
                        }
                    }
                }
            }
        }
        throw  {ID: 424, MESSAGE: "dataset not found"};
    }

    private isIDUbiquitous(ids: string[]) {
        for (let j = 0; j < ids.length; j++) {
            if (ids[j].indexOf("_") != -1) {
                let curr_id: string = ids[j].substr(0,ids[j].indexOf("_"));
                if (curr_id != this.id) {
                    throw {ID: 400, MESSAGE: "multiple dataset IDs present"}
                }
            }
        }
    }

    /**
     * Main query method
     * @param query
     * @returns {any}
     */
    public query(query: QueryRequest): QueryResponse {
        QueryController.isValid(query);
        let trueGet: any = [];
        if (typeof(query.GET) == "string") {
            trueGet.push(query.GET);
        } else {
            trueGet = query.GET;
        }

        var allObjects: any[] = this.getAllObjects(trueGet); //also sets ID
        this.isIDUbiquitous(trueGet);
        var filteredObjects: any[];

        let whereObject: any = query.WHERE;
        let operation: any = Object.keys(whereObject)[0];
        switch (Object.keys(whereObject).length) {
            case 0:
                filteredObjects = allObjects;
                break;
            case 1:
                filteredObjects = this.filterObjects(operation, whereObject[operation], allObjects, false);
                break;
            default:
                throw  {ID: 400, MESSAGE: "Where has multiple initial keys"};
        }

        var filteredGroups: any[] = this.groupAndApply(filteredObjects, query.GROUP, query.APPLY, trueGet);
        var asType: string = query.AS;
        if(asType != "TABLE") {
            throw  {ID: 400, MESSAGE: "Invalid type given for AS"};
        }

        if(query.hasOwnProperty("ORDER")) {
            if (typeof(query.ORDER) === "object") {
                let sObject: any = query.ORDER;
                if (Object.keys(sObject).length != 2 || !sObject.hasOwnProperty("dir") || !sObject.hasOwnProperty("keys")) {
                    throw  {ID: 400, MESSAGE: "ORDER is an object (not a string) but isn't a valid sortObject"};
                }
                for (let i = 0; i < sObject["keys"].length; i++) {
                    if (trueGet.indexOf(sObject["keys"][i]) === -1) {
                        throw  {ID: 400, MESSAGE: "Key for ORDER within ORDER.keys is not present in keys for GET"};
                    }
                }
            } else {
                if (trueGet.indexOf(query.ORDER) === -1) {
                    throw  {ID: 400, MESSAGE: "Key for ORDER not present in keys for GET"};
                }
            }
            var orderedGroups: any[] = QueryController.orderGroups(filteredGroups, query.ORDER);
            var display_object: any = QueryController.displayGroups(orderedGroups, trueGet, asType);
        }
        else{
            var display_object: any = QueryController.displayGroups(filteredGroups, trueGet, asType);
        }
        return display_object;
    }

    private static validateGroupAndApply(group: string[], apply: {}[]) {
        //validate group
        if (group.length == 0) {
            throw {ID: 400, MESSAGE: "GROUP cannot exist and be empty"};
        }

        //make sure no key appears in both group and apply
        for (let g = 0; g < group.length; g++) {
            for (let a = 0; a < apply.length; a++) {
                let applyObject: any = apply[a];
                let innerObject: any = applyObject[Object.keys(applyObject)[0]];
                let applyKey: string = innerObject[Object.keys(innerObject)[0]];
                if (group[g] == applyKey) {
                    throw {ID: 400, MESSAGE: "The following key was found in both apply and group: " + applyKey};
                }
            }
        }

    }

    private doGrouping(filteredObjects: Section[], group: string[], get: string[]): any[] {
        let filteredGroups: any[] = [];
        let sortedObjects: any[] = filteredObjects;
        let convertedFieldNames: string[] = [];
        for (let g = 0; g < group.length; g++) {
            convertedFieldNames.push(this.convertFieldNames(group[g]));
        }
        if(sortedObjects.length > 0) {
            sortedObjects = sortedObjects.sort(OperatorHelpers.dynamicSort(convertedFieldNames, true));
            let last: any = {};
            var currGroup: any = {};
            for (let s = 0; s < sortedObjects.length; s++) {
                let curr: any = sortedObjects[s];
                let same: boolean = true;
                for (let g = 0; g < group.length; g++) {
                    if (curr[this.convertFieldNames(group[g])] != last[this.convertFieldNames(group[g])]) {
                        same = false;
                        break;
                    }
                }
                if (!same) {
                    if (currGroup.hasOwnProperty("objects")) {
                        filteredGroups.push(JSON.parse(JSON.stringify(currGroup)));
                    }
                    currGroup = {objects: [curr]};
                    for (let g = 0; g < group.length; g++) {
                        currGroup[group[g]] = curr[this.convertFieldNames(group[g])];
                    }
                } else {
                    currGroup.objects.push(curr);
                }
                last = curr;
            }
            filteredGroups.push(currGroup);
        }
        return filteredGroups;
    }

    private static getApplyFieldValue(group: any, opCode: string, field: string) {
        let handlerFunction: any;
        switch (opCode) {
            case "MAX":
                handlerFunction = OperatorHelpers.handle_max;
                break;
            case "MIN":
                handlerFunction = OperatorHelpers.handle_min;
                break;
            case "AVG":
                handlerFunction = OperatorHelpers.handle_avg;
                break;
            case "COUNT":
                handlerFunction = OperatorHelpers.handle_count;
                break;
            default:
                throw  {ID: 400, MESSAGE: "Invalid opCode received on APPLY: " + opCode};
        }
        return handlerFunction(group.objects, field);
    }

    private doApplying(groups: any[], apply: {}[]): any[] {
        for (let g = 0; g < groups.length; g++) {
            let currGroup: any = groups[g];
            for (let a = 0; a < apply.length; a++) {
                let currApplyObject: any = apply[a];
                let newFieldName: string = Object.keys(currApplyObject)[0];
                let innerApplyObject: any = currApplyObject[newFieldName];
                let opCode: string = Object.keys(innerApplyObject)[0];
                currGroup[newFieldName] = QueryController.getApplyFieldValue(currGroup, opCode, this.convertFieldNames(innerApplyObject[opCode]))
            }
            groups[g] = currGroup;
        }
        return groups;
    }

    private groupAndApply(filteredObjects: Section[], group: string[], apply: {}[], get: string[]): any[] {
        let filteredGroups: any[] = [];
        if (group == undefined) {
            // each object is now its own group
            for (let s = 0; s < filteredObjects.length; s++) {
                let curr: any = filteredObjects[s];
                let newGroup: any = {objects: [curr]};
                for(let k = 0; k < get.length; k++) {
                    var convertedField: string = this.convertFieldNames(get[k]);
                    newGroup[get[k]] = curr[convertedField];
                }
                filteredGroups.push(newGroup);
            }
            return filteredGroups;
        }
        QueryController.validateGroupAndApply(group, apply);
        filteredGroups = this.doGrouping(filteredObjects, group, get);
        return(this.doApplying(filteredGroups, apply));
    }

    /**
     * Convert key corresponding to property of an object to the correct key for SECTION objects. Only call this method
     * with keys containing underscores.
     * @param key
     * @returns {string}
     */
    private convertFieldNames(key: string): string {
        key = key.replace("[","");
        key = key.replace("]","");
        if (this.id == "rooms") {
            switch (key) {
                case this.id+"_fullname":
                    key = "full_name";
                    break;
                case this.id+"_shortname":
                    key = "short_name";
                    break;
                case this.id+"_number":
                    key = "number";
                    break;
                case this.id+"_name":
                    key = "name";
                    break;
                case this.id+"_address":
                    key = "address";
                    break;
                case this.id+"_lat":
                    key = "lat";
                    break;
                case this.id+"_lon":
                    key = "lon";
                    break;
                case this.id+"_seats":
                    key = "seats";
                    break;
                case this.id+"_type":
                    key = "type";
                    break;
                case this.id+"_furniture":
                    key = "furniture";
                    break;
                case this.id+"_href":
                    key = "href";
                    break;
                case this.id+"_distance":
                    key = "distance";
                    break;
                default:
                    if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                        throw  {ID: 400, MESSAGE: "key not corresponding to valid field: " + key};
                    }
                    throw  {ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where"};
            }
        } else {
            switch (key) {
                case this.id+"_dept":
                    key = "dept";
                    break;
                case this.id+"_id":
                    key = "course_num";
                    break;
                case this.id+"_uuid":
                    key = "section_id";
                    break;
                case this.id+"_avg":
                    key = "avg";
                    break;
                case this.id+"_instructor":
                    key = "professor";
                    break;
                case this.id+"_title":
                    key = "title";
                    break;
                case this.id+"_pass":
                    key = "pass";
                    break;
                case this.id+"_fail":
                    key = "fail";
                    break;
                case this.id+"_size":
                    key = "size";
                    break;
                case this.id+"_year":
                    key = "year";
                    break;
                case this.id+"_audit":
                    key = "audit";
                    break;
                default:
                    if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                        throw  {ID: 400, MESSAGE: "key not corresponding to valid field: " + key};
                    }
                    throw  {ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where"};
            }
        }
        return key;
    }

    /**
     * Filters an array of objects filtered by a specific op code and a specific property of the objects and returns the
     * filtered array.
     * @param opCode
     * @param rest
     * @param objects
     * @returns {Section[]}
     */
    private baseObjectFilter(opCode: string, rest: any, objects: any[]): any[] {
        if (Object.keys(rest).length != 1) {
            throw  {ID: 400, MESSAGE: "Base opCode has many or zero initial keys"};
        }
        let key: string = Object.keys(rest)[0];
        key = this.convertFieldNames(key);
        let value: any = rest[Object.keys(rest)[0]];
        if (opCode == "IS" || opCode == "NIS") {
            if (typeof value !== "string") {
                throw {ID: 400, MESSAGE: "Base opCode of IS or NIS does not contain string value"};
            }
        } else {
            if (typeof value !== "number") {
                throw {ID: 400, MESSAGE: "Base opCode of GT, LT, EQ or NEQ does not contain numeric value"};
            }
        }
        let operator: any;
        switch (opCode) {
            case "GT":
                operator = OperatorHelpers.GreaterThan;
                break;
            case "LT":
                operator = OperatorHelpers.LessThan;
                break;
            case "EQ":
                operator = OperatorHelpers.EqualTo;
                break;
            case "IS":
                operator = OperatorHelpers.StringIsEqualTo;
                break;
            case "NEQ":
                operator = OperatorHelpers.NotEqualTo;
                break;
            case "NIS":
                operator = OperatorHelpers.StringIsNotEqualTo;
                break;
            default:
                throw  {ID: 400, MESSAGE: "Invalid base op code passed to baseObjectFilter: " + opCode};
        }
        let numObjects: number = objects.length;
        let filteredObjects: any[] = [];
        for (let i = 0; i < numObjects; i++) {
            let currObject: any = objects[i];
            if (operator(currObject, key, value)) {
                filteredObjects.push(currObject);
            }
        }
        return filteredObjects;
    }

    /**
     * Takes a list of arrays filtered by baseObjectFilter and compares them to find objects in all of the arrays or
     * in any of the arrays depending on the op code.
     * @param opCode
     * @param object_arrays
     * @returns {Section[]}
     */
    private static joinFilters(opCode: string, object_arrays: any[][]): any[] {
        let filtered_objects: any[] = [];
        switch (opCode) {
            case "AND":
                object_arrays.sort(OperatorHelpers.compare_arrays);
                for (let i = 0; i < object_arrays[0].length; i++) {
                    let currKey: string = object_arrays[0][i].id_key;
                    let should_add: boolean;
                    for (let j = 1; j < object_arrays.length; j++) {
                        should_add = false;
                        for (let ii = 0; ii < object_arrays[j].length; ii++) {
                            if (object_arrays[j][ii].id_key == currKey) {
                                should_add = true;
                                break;
                            }
                        }
                        if (!should_add) {
                            break;
                        }
                    }
                    if (should_add) {
                        filtered_objects.push(object_arrays[0][i]);
                    }
                }
                break;
            case "OR":
                let filtered_object_keys: any = {};
                for (let i = 0; i < object_arrays.length; i++) {
                    for (let j = 0; j < object_arrays[i].length; j++) {
                        if (!(object_arrays[i][j].id_key in filtered_object_keys)) {
                            filtered_object_keys[object_arrays[i][j].id_key] = true;
                            filtered_objects.push(object_arrays[i][j]);
                        }
                    }
                }
                break;
            default:
                throw  {ID: 400, MESSAGE: "Invalid logical operator given to join filter: " + opCode};
        }
        return filtered_objects;
    }

    /**
     * Takes a query.WHERE object and uses it to filter a list of all of the objects in a dataset.
     * @param opCode
     * @param rest
     * @param objects
     * @param negated
     * @returns {Section[]}
     */
    public filterObjects(opCode: string, rest: any, objects: any[], negated: boolean): any[] {
        if (opCode == "GT" || opCode == "LT" || opCode == "EQ" || opCode == "IS") {
            if (!negated) {
                return this.baseObjectFilter(opCode, rest, objects);
            } else {
                switch (opCode) {
                    case "GT":
                        return this.baseObjectFilter("LT", rest, objects);
                    case "LT":
                        return this.baseObjectFilter("GT", rest, objects);
                    case "EQ":
                        return this.baseObjectFilter("NEQ", rest, objects);
                    case "IS":
                        return this.baseObjectFilter("NIS", rest, objects);
                    default:
                        throw  {ID: 400, MESSAGE: "Invalid base opCode: " + opCode};
                }
            }
        } else if (opCode == "NOT") {
            if (Object.keys(rest).length != 1) {
                throw  {ID: 400, MESSAGE: "0 or many keys passed to NOT"};
            }
            let nextOpCode: string = Object.keys(rest)[0];
            let nextRest: any = rest[Object.keys(rest)[0]];
            return this.filterObjects(nextOpCode, nextRest, objects, !negated);
        } else if (opCode == "OR" || opCode == "AND") {
            if (negated) {
                if (opCode == "OR") {
                    opCode = "AND";
                } else {
                    opCode = "OR";
                }
            }
            let numKeys: number = Object.keys(rest).length;
            var conditionArrays: Section[][] = [];
            for (let i = 0; i < numKeys; i++) {
                let conditionObject: any = rest[Object.keys(rest)[i]];
                if (Object.keys(conditionObject).length != 1) {
                    throw  {ID: 400, MESSAGE: "condition object within AND or OR has 0 or 2+ keys"};
                }
                let nextOpCode: string = Object.keys(conditionObject)[0];
                let nextRest: any = conditionObject[nextOpCode];
                conditionArrays.push(this.filterObjects(nextOpCode, nextRest, objects, negated));
            }
            return QueryController.joinFilters(opCode, conditionArrays)
        } else {
            throw  {ID: 400, MESSAGE: "Invalid opCode: " + opCode};
        }
    }

    /**
     * Order objects by either a string (d1) or a sortObject (d2).
     * @param filteredGroups
     * @param instruction
     * @returns {any[]}
     */
    private static orderGroups(filteredGroups: any[], instruction: string | sortObject): any[] {
        if (typeof(instruction) === "string") {
            return filteredGroups.sort(OperatorHelpers.dynamicSort([<string> instruction], true));
        } else {
            let oInstruction: any = instruction;
            let ascending: boolean = (oInstruction.dir == "UP") ? true: false;
            return filteredGroups.sort(OperatorHelpers.dynamicSort(oInstruction.keys, ascending));
        }
    }

    /**
     * Takes an array of groups, and the columns from GET and then creates a new display object where each field
     * corresponds to a string in GET and each value corresponds to a value in our filtered groups object.
     * @param groupArray
     * @param columns
     * @param displayType
     * @returns {{render: string, result: any[]}}
     */
    private static displayGroups(groupArray: any[], columns: string[], displayType: string): any {
        let returnObjectArray: any[] = [];
        for(let g = 0; g < groupArray.length; g++){       //create column objects and push into returnObjectArray
            let columnObject: any = {};
            for(let i = 0; i < columns.length; i++){
                columnObject[columns[i]] = groupArray[g][columns[i]];
            }
            returnObjectArray.push(columnObject);
        }
        return {"render": displayType, "result": returnObjectArray};
    }

}
