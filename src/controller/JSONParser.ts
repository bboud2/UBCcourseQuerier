/**
 * Created by Ben on 9/25/2016.
 */

import {Section} from "./DatasetController";
import {Course} from "./DatasetController";


/*
    Will be passed: JSON OBJECT/STRING
                    Dept
                    ID

 */

export default class JsonParser{




    public static parseCourse(department: string, id: string, course: string): Course {


        let returnCourse: Course = {dept: department, id: id};  //init Course to be returned at end
        let courseJSON: any = JSON.parse(course);           //parse Course string data into JSON

        let num_sections: number = courseJSON.result.length;//init number of courses contained in file
        for(let i: number = 0; i < num_sections; i++){      //loop and parse all contained sections
            returnCourse[i] = JsonParser.parseSection(courseJSON.result[i]);
        }
    return returnCourse;
    }

    private static parseSection(section: any): Section{

        let returnSection: Section = {avg: null, professor: null, title: null, pass: null, fail: null, audit: null};  //initialize section to be returend

        let sectionJSON = section;                // turn section into JSON object

        try{                                                  //Add all fields into returnSection
            returnSection.avg = sectionJSON.Avg;              //if field DNE, handle w/ catch
        }
        catch(err){}

        try{
            returnSection.professor = sectionJSON.Professor;
        }
        catch(err){}

        try{
            returnSection.title = sectionJSON.Title;
        }
        catch(err){}

        try{
            returnSection.pass = sectionJSON.Pass;

        }
        catch(err){}

        try{
            returnSection.fail = sectionJSON.Fail;
        }
        catch(err){}

        try{
            returnSection.audit = sectionJSON.Audit;
        }
        catch(err){}


        return returnSection;
    }




}