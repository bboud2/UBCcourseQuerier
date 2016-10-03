/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import {Section} from "./DatasetController";
import OperatorHelpers from "./OperatorHelpers";

export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
}

export interface QueryResponse {
}

export default class QueryController {
    private datasets: Datasets = null;
    private id: string = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public static isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        throw("Query is undefined");
    }

    private getAllSections(id: String): Section[] {
        var sectionList: Section[] = [];
        for(let i = 0; i < this.datasets.sets.length; i++){
            if (this.datasets.sets[i].id_key == id) {
                for (let j = 0; j < this.datasets.sets[i].courses.length; j++) {
                    sectionList = sectionList.concat(this.datasets.sets[i].courses[j].sections)
                }
            }
        }
        return sectionList;
    }

    public query(query: QueryRequest, id: string): QueryResponse {
        QueryController.isValid(query);
        this.id = id;
        let trueGet: any = [];
        if (typeof(query.GET) == "string") {
            trueGet.push(query.GET);
        } else {
            trueGet = query.GET;
        }

        var allSections: Section[] = this.getAllSections(id);
        let whereObject: any = query.WHERE;
        let operation: any = Object.keys(whereObject)[0];
        var filteredSections: Section[] = this.filterSections(operation, whereObject[operation], allSections, false);



        if(query.ORDER !== undefined) {
            if (trueGet.indexOf(query.ORDER) === -1) {
                throw("Can't order by a non-displayed index");
            }
            var orderedSections: Section[] = this.orderSections(filteredSections, query.ORDER);
            var display_object: any = this.displaySections(orderedSections, trueGet);
        }
        else{
            var display_object: any = this.displaySections(filteredSections, trueGet);
        }
        return display_object;
    }

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
                throw("key not corresponding to valid field: " + key);
        }
        return key;
    }

    private baseCourseFilter(opCode: string, rest: any, sections: Section[]): Section[] {
        let key: string = Object.keys(rest)[0];
        key = this.convertFieldNames(key);
        let value: string | number = rest[Object.keys(rest)[0]];
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
                throw("Invalid base op code passed to baseCourseFilter" + opCode);
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
                throw("Invalid logical operator given to join filter: " + opCode);
        }
        return filtered_sections;
    }

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
                        throw("Invalid base op code: " + opCode);
                }
            }
        } else if (opCode == "NOT") {
            let nextOpCode: string = Object.keys(rest)[0];
            let nextRest: any = rest[Object.keys(rest)[0]];
            return this.filterSections(nextOpCode, nextRest, sections, !negated);
        } else if (opCode == "OR" || opCode == "AND") {
            let numKeys: number = Object.keys(rest).length;
            var conditionArrays: Section[][] = [];
            for (let i = 0; i < numKeys; i++) {
                let conditionObject: any = rest[Object.keys(rest)[i]];
                let nextOpCode: string = Object.keys(conditionObject)[0];
                let nextRest: any = conditionObject[nextOpCode];
                conditionArrays.push(this.filterSections(nextOpCode, nextRest, sections, negated));
            }
            return QueryController.joinFilters(opCode, conditionArrays)
        } else {
            throw("Invalid opCode: " + opCode)
        }
    }

    private orderSections(filteredSections: Section[], instruction: string):Section[] {
        switch (instruction) {
            case this.id+"_dept":
                return filteredSections.sort(OperatorHelpers.deptCompare);
            case this.id+"_id":
                return filteredSections.sort(OperatorHelpers.idCompare);
            case this.id+"_avg":
                return filteredSections.sort(OperatorHelpers.avgCompare);
            case this.id+"_instructor":
                return filteredSections.sort(OperatorHelpers.instructorCompare);
            case this.id+"_title":
                return filteredSections.sort(OperatorHelpers.titleCompare);
            case this.id+"_pass":
                return filteredSections.sort(OperatorHelpers.passCompare);
            case this.id+"_fail":
                return filteredSections.sort(OperatorHelpers.failCompare);
            case this.id+"_audit":
                return filteredSections.sort(OperatorHelpers.auditCompare);
            default:
                throw("Invalid instruction for ordering: " + instruction);
        }
    }

    private displaySections(sectionArray: Section[], colTypes: string[]): any{
        let returnObjectArray: any[] = [];
        let convertedColumnTypes: string[] = [];
        for(let z = 0; z < colTypes.length; z++){
            let convertedField: string = this.convertFieldNames(colTypes[z]);
            convertedColumnTypes.push(convertedField);
        }
        let trueSectionArray: any = sectionArray;
        for(let s = 0; s < trueSectionArray.length; s++){       //create column objects and push into returnObjectArray
            let columnObject: any = {};
            for(let i = 0; i < convertedColumnTypes.length; i++){
                columnObject[colTypes[i]] = trueSectionArray[s][convertedColumnTypes[i]];
            }
            returnObjectArray.push(columnObject);
        }
        return {"render": 'TABLE', "result": returnObjectArray};
    }

}
