/**
 * Created by Ben on 9/25/2016.
 */

import Log from "../Util";

import {Section} from "./DatasetController";

export default class JsonParser{

    private next_id: number;

    constructor() {
        this.next_id = 0;
    }

    public parseCourse(course: string): Section[] {

        let courseJSON: any = JSON.parse(course);
        let num_sections: number = courseJSON.result.length;
        let return_sections: Section[] = [];
        for (let i: number = 0; i < num_sections; i++) {
            return_sections.push(this.parseSection(courseJSON.result[i]));
        }
        return return_sections;
    }

    private parseSection(section: any): Section {
        let returnSection: Section = {
            id_key: this.next_id.toString(),
            dept: null,
            course_num: null,
            section_id: null,
            avg: null,
            professor: null,
            title: null,
            pass: null,
            fail: null,
            audit: null,
            year: null,
            size: null
        };

        // If field does not exist, do nothing usng catch block.
        try{
            returnSection.dept = section.Subject;
        }
        catch(err){}

        try{
            returnSection.course_num = section.Course;
        }
        catch(err){}

        try{
            returnSection.section_id = section.id.toString();
        }
        catch(err){}

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
            returnSection.size = parseInt(section.Pass);

        }
        catch(err){}

        try{
            returnSection.fail = section.Fail;
            if (returnSection.size == null) {
                returnSection.size = section.Fail;
            } else {
                returnSection.size += parseInt(section.Fail);
            }
        }
        catch(err){}

        try{
            returnSection.audit = section.Audit;
        }
        catch(err){}

        try{
            if (section.Section == "overall") {
                returnSection.year = 1900;
            } else {
                returnSection.year = section.Year;
            }
        }
        catch(err){}

        this.next_id++;
        return returnSection;
    }
}