/**
 * Created by Ben on 9/25/2016.
 */

import Log from "../Util";

import {Section} from "./DatasetController";
import {Course} from "./DatasetController";

export default class JsonParser{

    public static parseCourse(department: string, course_num: string, course: string): Course {

        let returnCourse: Course = {id_key: department+course_num,
            dept: department,
            course_num: course_num,
            sections: []};
        let courseJSON: any = JSON.parse(course);
        Log.trace(department + course_num);
        let num_sections: number = courseJSON.result.length;
        for (let i: number = 0; i < num_sections; i++) {
            returnCourse.sections[i] = JsonParser.parseSection(courseJSON.result[i]);
        }
        return returnCourse;
    }

    private static parseSection(section: any): Section{
        let returnSection: Section = {
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

        return returnSection;
    }
}