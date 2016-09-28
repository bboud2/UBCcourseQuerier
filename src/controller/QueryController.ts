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

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    private getAllSections(datasets: Datasets): Section[] {
        var sectionList: Section[] = [];
        for(var set in this.datasets.sets){
            let trueSet: any = set;
            for (var course in trueSet.courses) {
                let trueCourse: any = course;
                sectionList.concat(trueCourse.sections)
            }
        }
        return sectionList;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        var allSections: Section[] = this.getAllSections(this.datasets);
        let whereObject: any = query.WHERE;
        let operation: any = whereObject.keys[0];
        var filteredSections: Section[] = QueryController.filterSections(operation, whereObject[operation], allSections, false);

        let trueGet: any = [];
        if (typeof(query.GET) == "string") {
            trueGet.push(query.GET);
        } else {
            trueGet = query.GET;
        }

        if(query.ORDER !== undefined) {
            var orderedSections: Section[] = QueryController.orderSections(filteredSections, query.ORDER);
            var display_object: any = QueryController.displaySections(orderedSections, trueGet);
        }
        else{
            var display_object: any = QueryController.displaySections(filteredSections, trueGet);
        }
        return display_object;
    }

    private static convertFieldNames(key: string): string {
        switch (key) {
            case "courses_dept":
                key = "dept";
                break;
            case "courses_id":
                key = "id";
                break;
            case "courses_avg":
                key = "avg";
                break;
            case "courses_instructor":
                key = "professor";
                break;
            case "courses_title":
                key = "title";
                break;
            case "courses_pass":
                key = "pass";
                break;
            case "courses_fail":
                key = "fail";
                break;
            case "courses_audit":
                key = "audit";
                break;
            default:
                Log.trace("improper base key sent");
        }
        return key;
    }

    private static baseCourseFilter(opCode: string, rest: any, sections: Section[]): Section[] {
        let numSections: number = sections.length;
        let filteredSections: Section[] = [];
        let key: string = rest.keys[0];
        key = QueryController.convertFieldNames(key);
        let value: string | number = rest[rest.keys[0]];
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
                Log.trace("Invalid base op code passed to baseCourseFilter");
                return sections;
        }
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
                for (let i = 0; i < section_arrays[0].length; i++) {
                    let shouldAdd: boolean;
                    for (let j = 1; j < section_arrays.length; j++) {
                        shouldAdd = false;
                        for (let jj = 0; jj < section_arrays[j].length; jj++) {
                            if (section_arrays[j][jj].id_key == section_arrays[0][i].id_key) {
                                shouldAdd = true;
                            }
                        }
                        if (!shouldAdd) {
                            break;
                        }
                    }
                    if (shouldAdd) {
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
                Log.trace("Invalid logical operator given to join filter");
                return section_arrays[0];
        }
        return filtered_sections;
    }

    public static filterSections(opCode: string, rest: any, sections: Section[], negated: boolean): Section[] {
        if (opCode == "GT" || opCode == "LT" || opCode == "EQ" || opCode == "IS") {
            if (!negated) {
                return QueryController.baseCourseFilter(opCode, rest, sections);
            } else {
                switch (opCode) {
                    case "GT":
                        return QueryController.baseCourseFilter("LT", rest, sections);
                    case "LT":
                        return QueryController.baseCourseFilter("GT", rest, sections);
                    case "EQ":
                        return QueryController.baseCourseFilter("NEQ", rest, sections);
                    case "IS":
                        return QueryController.baseCourseFilter("NIS", rest, sections);
                    default:
                        Log.trace("Invalid base op code");
                        return sections;
                }
            }
        } else if (opCode == "NOT") {
            let nextOpCode: string = rest.keys[0];
            let nextRest: any = rest[rest.keys[0]];
            return QueryController.filterSections(nextOpCode, nextRest, sections, !negated);
        } else {
            let numKeys: number = rest.keys.length;
            var conditionArrays: Section[][] = [];
            for (let i = 0; i < numKeys; i++) {
                let nextOpCode: string = rest.keys[i];
                let nextRest: any = rest[rest.keys[i]];
                conditionArrays.push(QueryController.filterSections(nextOpCode, nextRest, sections, negated));
            }
            return QueryController.joinFilters(opCode, conditionArrays)
        }
    }

    private static orderSections(filteredSections: Section[], instructions: string):Section[] {
        switch (instructions) {
            case "courses_dept":
                return filteredSections.sort(OperatorHelpers.deptCompare);
            case "courses_id":
                return filteredSections.sort(OperatorHelpers.idCompare);
            case "courses_avg":
                return filteredSections.sort(OperatorHelpers.avgCompare);
            case "courses_instructor":
                return filteredSections.sort(OperatorHelpers.instructorCompare);
            case "courses_title":
                return filteredSections.sort(OperatorHelpers.titleCompare);
            case "courses_pass":
                return filteredSections.sort(OperatorHelpers.passCompare);
            case "courses_fail":
                return filteredSections.sort(OperatorHelpers.failCompare);
            case "courses_audit":
                return filteredSections.sort(OperatorHelpers.auditCompare);
        }
        return filteredSections;
    }

    private static displaySections(sectionArray: Section[], colTypes: string[]): any{
        let returnObjectArray: any[] = [];
        let convertedColumnTypes: string[] = [];
        for(var z in colTypes){
            let convertedField: string = QueryController.convertFieldNames(z);
            convertedColumnTypes.push(convertedField);
        }

        for(var s in sectionArray){       //create column objects and push into returnObjectArray
            let columnObject: any = {};
            let trueSection: any = s;
            for(let i = 0; i < convertedColumnTypes.length; i++){
                columnObject[colTypes[i]] = trueSection[convertedColumnTypes[i]];
            }
            returnObjectArray.push(columnObject);
        }

        return {"render": 'Table', "result": returnObjectArray};
    }

}
