/**
 * Created by k on 11/17/16.
 */

var request = require('request');

export default class SchedulerController {
    private messageObject: any = null;

    constructor(messageObject: any) {
        this.messageObject = messageObject;
    }

    public do_scheduling(): any {
        let rooms: any[] = this.messageObject["rooms"];
        let courses: any[] = this.messageObject["courses"];
        let i: number = 0;
        let j: number = 0;
        let jj:  number = 0;
        let ii: number = 0;
        let total_sections: number = 0;
        let scheduled_sections: number = 0;
        while (i < courses.length) {
            let curr_course: any = courses[i];
            let sections_to_schedule: number = Math.floor(curr_course["numSections"] / 3 + 1);
            curr_course["required to schedule"] = Math.floor(curr_course["numSections"] / 3 + 1);
            total_sections += sections_to_schedule;
            if (j < rooms.length) {
                let curr_room: any = rooms[j];
                let sections_size: number = curr_course["maxSize"];
                let curr_course_name: string = curr_course["courses_dept"] + " " + curr_course["courses_id"] + " (Size: " + sections_size.toString();
                let room_size: number = curr_room["rooms_seats"];
                if (room_size >= sections_size) {
                    if (jj == 0) {
                        curr_room["sections"] = [];
                    }
                    if (ii == 0) {
                        curr_course["rooms"] = [];
                    }
                    while (jj < 15 && ii < Math.min(sections_to_schedule, 15)) {
                        curr_room["sections"][jj] = " " + curr_course_name + ", Section: " + (ii + 1).toString() + "/" + sections_to_schedule.toString() + ")";
                        curr_course["rooms"][ii] = " " + curr_room["rooms_name"] + " on " + SchedulerController.getTimeFromIndex(jj);
                        jj++;
                        ii++;
                        scheduled_sections++;
                    }
                    if (jj == 15) {
                        j++;
                        jj = 0;
                    }
                    if (ii = Math.min(sections_to_schedule, 15)) {
                        i++;
                        ii = 0;
                    }
                } else {
                    if (ii == 0) {
                        curr_course["rooms"] = ["No sections were able to be scheduled"];
                    } else {
                        curr_course["rooms"][ii] = " Remaining sections could not be scheduled";
                    }
                    ii = 0;
                    i++;
                }
            } else {
                if (ii == 0) {
                    curr_course["rooms"] = ["No sections were able to be scheduled"];
                } else {
                    curr_course["rooms"][ii] = " Remaining sections could not be scheduled";
                }
                ii = 0;
                i++;
            }
        }
        let outputObject: any = {};
        outputObject["rooms"] = rooms;
        outputObject["courses"] = courses;
        outputObject["strength"] = scheduled_sections / total_sections;
        return outputObject;
    }

    private static getTimeFromIndex(index: number): string {
        let output: string = "";
        if (index < 9) {
            let start_time: number = index + 8;
            output += "MWF from " + SchedulerController.convert_num_to_time(start_time) + " to " + SchedulerController.convert_num_to_time(start_time + 1)
        } else {
            let start_time: number = (index - 9) * 1.5 + 8;
            output += "TR from " + SchedulerController.convert_num_to_time(start_time) + " to " + SchedulerController.convert_num_to_time(start_time + 1.5)
        }
        return output;
    }

    private static convert_num_to_time(num: number): string {
        let output: string;
        if (num % 1 === 0) {
            output = num.toString() + ":00";
        } else {
            output = Math.floor(num).toString() + ":30";
        }
        return output;
    }
}

