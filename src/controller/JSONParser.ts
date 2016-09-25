/**
 * Created by Ben on 9/25/2016.
 */

import DatasetController from "../src/controller/DatasetController";
import {Section} from "./DatasetController";


/*
    Will be passed: JSON OBJECT/STRING
                    Dept
                    ID

 */

export default class JsonParser{




    public static parseCourse(department: string, id: string, course: string): DatasetController.Course{


        let returnCourse = new DatasetController.Course();  //init Course to be returned at end
        let courseJSON: any = JSON.parse(course);           //parse Course string data into JSON

        returnCourse.dept = department;
        returnCourse.id   = id;

        let num_sections: number = courseJSON.result.length;//init number of courses contained in file
        for(let i: number = 0; i < num_sections; i++){      //loop and parse all contained Course-sections
            returnCourse[i] = JsonParser.parseSection(courseJSON.result[i]);
        }
    return returnCourse;
    }

    private static parseSection(section: any): DatasetController.Section{

        let returnSection = new DatasetController.Section();  //initialize section to be returend

        let sectionJSON = JSON.parse(section);                // turn section into JSON object

        try{                                                  //Add all fields into returnSection
            returnSection.avg = sectionJSON.avg;              //if field DNE, handle w/ catch
        }
        catch(err){}

        try{
            returnSection.instructor = sectionJSON.instructor;
        }
        catch(err){}

        try{
            returnSection.title = sectionJSON.title;
        }
        catch(err){}

        try{
            returnSection.pass = sectionJSON.pass;

        }
        catch(err){}

        try{
            returnSection.fail = sectionJSON.fail;
        }
        catch(err){}

        try{
            returnSection.audit = sectionJSON.audit;
        }
        catch(err){}


        return returnSection;
    }




}