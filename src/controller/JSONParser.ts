/**
 * Created by Ben on 9/25/2016.
 */

import Log from "../Util";

import {Section, Course} from "./DatasetController";

export default class JsonParser{

    private next_id: number;

    constructor() {
        this.next_id = 0;
    }

    public parseCourse(department: string, course_num: string, course: string): Course {

        let returnCourse: Course = {id_key: department+course_num,
            dept: department.toLowerCase(),
            course_num: course_num,
            sections: []};
        let courseJSON: any = JSON.parse(course);
        let num_sections: number = courseJSON.result.length;
        for (let i: number = 0; i < num_sections; i++) {
            returnCourse.sections[i] = this.parseSection(courseJSON.result[i], department, course_num);
        }
        return returnCourse;
    }

    private parseSection(section: any, department: string, course_num: string): Section{
        let returnSection: Section = {
            id_key: this.next_id.toString(),
            dept: department.toLowerCase(),
            course_num: course_num.toLowerCase(),
            avg: null,
            professor: null,
            title: null,
            pass: null,
            fail: null,
            audit: null};

        // If field does not exist, do nothing usng catch block.
        try{
            returnSection.avg = section.Avg;
        }
        catch(err){}

        try{
            returnSection.professor = section.Professor;
        }
        catch(err){}

        try{
            returnSection.title = section.Title;
        }
        catch(err){}

        try{
            returnSection.pass = section.Pass;

        }
        catch(err){}

        try{
            returnSection.fail = section.Fail;
        }
        catch(err){}

        try{
            returnSection.audit = section.Audit;
        }
        catch(err){}

        this.next_id++;
        return returnSection;
    }
}