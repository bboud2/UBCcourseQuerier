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

    private getAllCourses(datasets: Datasets): Course[] {
        var courseList: Course[] = [];
        for(var set in this.datasets.sets){
            let trueSet: any = set;
            courseList.push(trueSet);
        }
        return courseList;
    }

    public query(query: QueryRequest): QueryResponse {
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');
        var allCourses: Course[] = this.getAllCourses(this.datasets);
        let whereObject: any = query.WHERE;
        let operation: any = whereObject.keys[0];
        var filteredCourses: Course[] = this.filterCourses(operation, whereObject[operation], allCourses, false);


        return {status: 'received', ts: new Date().getTime()};
    }

    private baseCourseFilter(opCode: string, rest: any, courses: Course[]): Course[] {
        // also implement NEQ for negations
    }

    private joinFilters(opCode: string, course_arrays: Course[][]): Course[] {

    }

    public filterCourses(opCode: string, rest: any, courses: Course[], negated: boolean): Course[] {
        if (opCode == "GT" || opCode == "LT" || opCode == "EQ") {
            if (!negated) {
                return this.baseCourseFilter(opCode, rest, courses);
            } else {
                switch (opCode) {
                    case "GT":
                        return this.baseCourseFilter("LT", rest, courses);
                    case "LT":
                        return this.baseCourseFilter("GT", rest, courses);
                    case "EQ":
                        return this.baseCourseFilter("NEQ", rest, courses);
                    default:
                        Log.trace("Invalid base op code");
                }
            }
        } else if (opCode == "NOT") {
            let nextOpCode: string = rest.keys[0];
            let nextRest: any = rest[rest.keys[0]];
            return this.filterCourses(nextOpCode, nextRest, courses, !negated);
        } else {
            let numKeys: number = rest.keys.length;
            var conditionArrays: Course[][] = [];
            for (let i = 0; i < numKeys; i++) {
                let nextOpCode: string = rest.keys[i];
                let nextRest: any = rest[rest.keys[i]];
                conditionArrays.push(this.filterCourses(nextOpCode, nextRest, courses, negated));
            }
            return this.joinFilters(opCode, conditionArrays)
        }
    }
}
