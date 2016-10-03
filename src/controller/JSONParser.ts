/**
 * Created by Ben on 9/25/2016.
 */

import Log from "../Util";

import {Section, Course} from "./DatasetController";

export default class JsonParser{

    public static parseCourse(department: string, course_num: string, course: string): Course {

        let returnCourse: Course = {id_key: department+course_num,
            dept: department.toLowerCase(),
            course_num: course_num,
            sections: []};
        let courseJSON: any = JSON.parse(course);
        let num_sections: number = courseJSON.result.length;
        for (let i: number = 0; i < num_sections; i++) {
            returnCourse.sections[i] = JsonParser.parseSection(courseJSON.result[i], department, course_num);
        }
        return returnCourse;
    }

    private static parseSection(section: any, department: string, course_num: string): Section{
        let returnSection: Section = {
            id_key: department+course_num,
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
            returnSection.id_key += section.Avg;
        }
        catch(err){}

        try{
            returnSection.professor = section.Professor;
            returnSection.id_key += section.Professor;
        }
        catch(err){}

        try{
            returnSection.title = section.Title;
            returnSection.id_key += section.Title;
        }
        catch(err){}

        try{
            returnSection.pass = section.Pass;
            returnSection.id_key += section.Pass.toString();

        }
        catch(err){}

        try{
            returnSection.fail = section.Fail;
            returnSection.id_key += section.Fail.toString();
        }
        catch(err){}

        try{
            returnSection.audit = section.Audit;
            returnSection.id_key += section.Audit.toString();
        }
        catch(err){}

        return returnSection;
    }
}