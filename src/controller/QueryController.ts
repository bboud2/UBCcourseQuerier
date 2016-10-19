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
                QueryController.isValidKey(trueGet[i], groupApplyStatus, query);
            }
            return true;
        }
        throw {ID: 400, MESSAGE: "Query is invalid"}
    }

    /**
     * Gets all sections in the dataset titled id.
     * @param id
     * @returns {Section[]}
     */
    private getAllSections(id: String): Section[] {
        for (let i = 0; i < this.datasets.sets.length; i++){
            if (this.datasets.sets[i].id_key == id) {
                return this.datasets.sets[i].sections;
            }
        }
        throw  {ID: 424, MESSAGE: "dataset not found"};
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
        for (let i = 0; i < trueGet.length; i++) {
            let curr_key: string = trueGet[i];
            if (curr_key.indexOf("_") != -1) {
                this.id = trueGet[0].substr(0,trueGet[0].indexOf("_"));
                break;
            }
        }
        if (this.id === null) {
            throw  {ID: 400, MESSAGE: "No keys with an underscore so no dataset ID to look for"};
        }
        var allSections: Section[] = this.getAllSections(this.id);
        var filteredSections: Section[];

        let whereObject: any = query.WHERE;
        let operation: any = Object.keys(whereObject)[0];
        switch (Object.keys(whereObject).length) {
            case 0:
                filteredSections = allSections;
                break;
            case 1:
                filteredSections = this.filterSections(operation, whereObject[operation], allSections, false);
                break;
            default:
                throw  {ID: 400, MESSAGE: "Where has multiple initial keys"};
        }

        //TODO: convert all sections to groups either using GROUP or by making every section its own group. While doing this, also do APPLY.
        // will need to check that group and apply are valid... all keys in group/apply must also be present in GET.
        var filteredGroups: any[] = this.groupAndApply(filteredSections, query.GROUP, query.APPLY, trueGet);

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
            var orderedGroups: any[] = this.orderGroups(filteredGroups, query.ORDER);
            var display_object: any = this.displayGroups(orderedGroups, trueGet, asType);
        }
        else{
            var display_object: any = this.displayGroups(filteredGroups, trueGet, asType);
        }
        return display_object;
    }

    private static validateGroupAndApply(group: string[], apply: {}[], get: string[]) {
        //validate group
        for(let i = 0; i < group.length; i++) {
            let index: number = get.indexOf(group[i]);
            if (index == -1) {
                throw {ID: 400, MESSAGE: group[i] + " was found in GROUP but not in GET"};
            }
        }

        //validate apply
        for(let i = 0; i < apply.length; i++) {
            let currField: string = Object.keys(apply[i])[0];
            let index: number = get.indexOf(currField);
            if (index == -1) {
                throw {ID: 400, MESSAGE: currField + " was found in APPLY but not in GET"};
            }
        }
    }

    private doGrouping(filteredSections: Section[], group: string[], get: string[]): any[] {
        let filteredGroups: any[] = [];
        let sortedSections: Section[] = filteredSections;
        for (let g = 0; g < group.length; g++) {
            sortedSections = sortedSections.sort(OperatorHelpers.dynamicSort(this.convertFieldNames(group[g]), true))
        }
        let last: any = {};
        let currGroup: any = {};
        for (let s = 0; s < sortedSections.length; s++) {
            let curr: any = sortedSections[s];
            let same: boolean = true;
            for (let g = 0; g < group.length; g++) {
                if (curr[this.convertFieldNames(group[g])] != last[this.convertFieldNames(group[g])]) {
                    same = false;
                    break;
                }
            }
            if (!same) {
                if (currGroup.hasOwnProperty("sections")) {
                    filteredGroups.push(JSON.parse(JSON.stringify(currGroup)));
                }
                currGroup = {sections: [curr]};
                for (let g = 0; g < group.length; g++) {
                    currGroup[get[g]] = curr[this.convertFieldNames(group[g])];
                }
            } else {
                currGroup.sections.push(curr);
            }
            last = curr;
        }
        filteredGroups.push(currGroup);
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
        return handlerFunction(group.sections, field);
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
        }
        return groups;
    }

    private groupAndApply(filteredSections: Section[], group: string[], apply: {}[], get: string[]): any[] {
        let filteredGroups: any[] = [];
        if (group == undefined) {
            // each section is now its own group
            for (let s = 0; s < filteredSections.length; s++) {
                let curr: any = filteredSections[s];
                let newGroup: any = {sections: [curr]};
                for(let k = 0; k < get.length; k++) {
                    var convertedField: string = this.convertFieldNames(get[k]);
                    newGroup[convertedField] = curr[convertedField];
                }
                filteredGroups.push(newGroup);
            }
            return filteredGroups;
        }
        QueryController.validateGroupAndApply(group, apply, get);
        filteredGroups = this.doGrouping(filteredSections, group, get);
        return(this.doApplying(filteredGroups, apply));
    }

    /**
     * Convert key corresponding to property of a section to the correct key for SECTION objects. Only call this method
     * with keys containing underscores.
     * @param key
     * @returns {string}
     */
    private convertFieldNames(key: string): string {
        key = key.replace("[","");
        key = key.replace("]","");
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
            case this.id+"_audit":
                key = "audit";
                break;
            default:
                if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                    throw  {ID: 400, MESSAGE: "key not corresponding to valid field: " + key};
                }
                throw  {ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where"};

        }
        return key;
    }

    /**
     * Filters an array of sections by a specific op code and a specific property of the sections and returns the
     * filtered array.
     * @param opCode
     * @param rest
     * @param sections
     * @returns {Section[]}
     */
    private baseCourseFilter(opCode: string, rest: any, sections: Section[]): Section[] {
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
                throw  {ID: 400, MESSAGE: "Invalid base op code passed to baseCourseFilter: " + opCode};
        }
        let numSections: number = sections.length;
        let filteredSections: Section[] = [];
        for (let i = 0; i < numSections; i++) {
            let currSection: any = sections[i];
            if (operator(currSection, key, value)) {
                filteredSections.push(currSection);
            }
        }
        return filteredSections;
    }

    /**
     * Takes a list of arrays filtered by baseCourseFilter and compares them to find sections in all of the arrays or
     * in any of the arrays.
     * @param opCode
     * @param section_arrays
     * @returns {Section[]}
     */
    private static joinFilters(opCode: string, section_arrays: Section[][]): Section[] {
        let filtered_sections: Section[] = [];
        switch (opCode) {
            case "AND":
                section_arrays.sort(OperatorHelpers.compare_arrays);
                for (let i = 0; i < section_arrays[0].length; i++) {
                    let currKey: string = section_arrays[0][i].id_key;
                    let should_add: boolean;
                    for (let j = 1; j < section_arrays.length; j++) {
                        should_add = false;
                        for (let ii = 0; ii < section_arrays[j].length; ii++) {
                            if (section_arrays[j][ii].id_key == currKey) {
                                should_add = true;
                                break;
                            }
                        }
                        if (!should_add) {
                            break;
                        }
                    }
                    if (should_add) {
                        filtered_sections.push(section_arrays[0][i]);
                    }
                }
                break;
            case "OR":
                let filtered_section_keys: any = {};
                for (let i = 0; i < section_arrays.length; i++) {
                    for (let j = 0; j < section_arrays[i].length; j++) {
                        if (!(section_arrays[i][j].id_key in filtered_section_keys)) {
                            filtered_section_keys[section_arrays[i][j].id_key] = true;
                            filtered_sections.push(section_arrays[i][j]);
                        }
                    }
                }
                break;
            default:
                throw  {ID: 400, MESSAGE: "Invalid logical operator given to join filter: " + opCode};
        }
        return filtered_sections;
    }

    /**
     * Takes a query.WHERE object and uses it to filter a list of all of the sections in a dataset.
     * @param opCode
     * @param rest
     * @param sections
     * @param negated
     * @returns {Section[]}
     */
    public filterSections(opCode: string, rest: any, sections: Section[], negated: boolean): Section[] {
        if (opCode == "GT" || opCode == "LT" || opCode == "EQ" || opCode == "IS") {
            if (!negated) {
                return this.baseCourseFilter(opCode, rest, sections);
            } else {
                switch (opCode) {
                    case "GT":
                        return this.baseCourseFilter("LT", rest, sections);
                    case "LT":
                        return this.baseCourseFilter("GT", rest, sections);
                    case "EQ":
                        return this.baseCourseFilter("NEQ", rest, sections);
                    case "IS":
                        return this.baseCourseFilter("NIS", rest, sections);
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
            return this.filterSections(nextOpCode, nextRest, sections, !negated);
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
                conditionArrays.push(this.filterSections(nextOpCode, nextRest, sections, negated));
            }
            return QueryController.joinFilters(opCode, conditionArrays)
        } else {
            throw  {ID: 400, MESSAGE: "Invalid opCode: " + opCode};
        }
    }

    /**
     * Order sections by either a string (d1) or a sortObject (d2).
     * @param filteredGroups
     * @param instruction
     * @returns {any[]}
     */
    private orderGroups(filteredGroups: any[], instruction: string | sortObject): Section[] {
        if (typeof(instruction) === "string") {
            return filteredGroups.sort(OperatorHelpers.dynamicSort(this.convertFieldNames(<string> instruction), true));
        } else {
            let oInstruction: any = instruction;
            let orderedGroups: any[] = filteredGroups;
            let ascending: boolean = (oInstruction.dir == "UP") ? true: false;
            for (let i = oInstruction.keys.length - 1; i >= 0; i--) {
                let curr_key: string = oInstruction["keys"][i];
                if (curr_key.indexOf("_") != -1) {
                    orderedGroups = orderedGroups.sort(OperatorHelpers.dynamicSort(this.convertFieldNames(curr_key), ascending))
                } else {
                    orderedGroups = orderedGroups.sort(OperatorHelpers.dynamicSort(curr_key, ascending))
                }
            }
            return orderedGroups;
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
    private displayGroups(groupArray: any[], columns: string[], displayType: string): any{
        let returnObjectArray: any[] = [];
        let convertedColumnTypes: string[] = [];
        for(let i = 0; i < columns.length; i++){
            if (columns[i].indexOf("_") != -1) {
                var convertedField: string = this.convertFieldNames(columns[i]);
            } else {
                var convertedField: string = columns[i];
            }
            convertedColumnTypes.push(convertedField);
        }

        for(let g = 0; g < groupArray.length; g++){       //create column objects and push into returnObjectArray
            let columnObject: any = {};
            for(let i = 0; i < convertedColumnTypes.length; i++){
                columnObject[columns[i]] = groupArray[g][convertedColumnTypes[i]];
            }
            returnObjectArray.push(columnObject);
        }

        return {"render": displayType, "result": returnObjectArray};
    }

}
