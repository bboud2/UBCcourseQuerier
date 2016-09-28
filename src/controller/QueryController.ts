/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import {Section, Course} from "./DatasetController";

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
        var filteredSections: Section[] = this.filterSections(operation, whereObject[operation], allSections, false);


        return {status: 'received', ts: new Date().getTime()};
    }



    private baseCourseFilter(opCode: string, rest: any, sections: Section[]): Section[] {
        let numSections: number = sections.length;
        let filteredSections: Section[] = [];
        let key: string = rest.keys[0];
        let value: string | number = rest[rest.keys[0]];
        let operator: any;
        switch (opCode) {
            case "GT":
                // TODO
            case "LT":
            // TODO
            case "EQ":
            // TODO
            case "IS":
            // TODO
            case "NEQ":
            // TODO
            case "NIS":
            // TODO
            default:
                Log.trace("Invalid base op code passed to baseCourseFilter");
                return sections;
        }
    }

    private joinFilters(opCode: string, course_arrays: Section[][]): Section[] {

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
                        Log.trace("Invalid base op code");
                        return sections;
                }
            }
        } else if (opCode == "NOT") {
            let nextOpCode: string = rest.keys[0];
            let nextRest: any = rest[rest.keys[0]];
            return this.filterSections(nextOpCode, nextRest, sections, !negated);
        } else {
            let numKeys: number = rest.keys.length;
            var conditionArrays: Section[][] = [];
            for (let i = 0; i < numKeys; i++) {
                let nextOpCode: string = rest.keys[i];
                let nextRest: any = rest[rest.keys[i]];
                conditionArrays.push(this.filterSections(nextOpCode, nextRest, sections, negated));
            }
            return this.joinFilters(opCode, conditionArrays)
        }
    }
}
