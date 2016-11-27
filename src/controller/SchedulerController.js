"use strict";
var request = require('request');
var SchedulerController = (function () {
    function SchedulerController(messageObject) {
        this.messageObject = null;
        this.messageObject = messageObject;
    }
    SchedulerController.prototype.do_scheduling = function () {
        var rooms = this.messageObject["rooms"];
        var courses = this.messageObject["courses"];
        var i = 0;
        var j = 0;
        var jj = 0;
        var ii = 0;
        var total_sections = 0;
        var scheduled_sections = 0;
        while (i < courses.length) {
            var curr_course = courses[i];
            var sections_to_schedule = Math.floor(curr_course["numSections"] / 3 + 1);
            curr_course["required to schedule"] = Math.floor(curr_course["numSections"] / 3 + 1);
            total_sections += sections_to_schedule;
            if (j < rooms.length) {
                var curr_room = rooms[j];
                var sections_size = curr_course["maxSize"];
                var curr_course_name = curr_course["courses_dept"] + " " + curr_course["courses_id"] + " (Size: " + sections_size.toString();
                var room_size = curr_room["rooms_seats"];
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
                }
                else {
                    if (ii == 0) {
                        curr_course["rooms"] = ["No sections were able to be scheduled"];
                    }
                    else {
                        curr_course["rooms"][ii] = " Remaining sections could not be scheduled";
                    }
                    ii = 0;
                    i++;
                }
            }
            else {
                if (ii == 0) {
                    curr_course["rooms"] = ["No sections were able to be scheduled"];
                }
                else {
                    curr_course["rooms"][ii] = " Remaining sections could not be scheduled";
                }
                ii = 0;
                i++;
            }
        }
        var outputObject = {};
        outputObject["rooms"] = rooms;
        outputObject["courses"] = courses;
        outputObject["strength"] = scheduled_sections / total_sections;
        return outputObject;
    };
    SchedulerController.getTimeFromIndex = function (index) {
        var output = "";
        if (index < 9) {
            var start_time = index + 8;
            output += "MWF from " + SchedulerController.convert_num_to_time(start_time) + " to " + SchedulerController.convert_num_to_time(start_time + 1);
        }
        else {
            var start_time = (index - 9) * 1.5 + 8;
            output += "TR from " + SchedulerController.convert_num_to_time(start_time) + " to " + SchedulerController.convert_num_to_time(start_time + 1.5);
        }
        return output;
    };
    SchedulerController.convert_num_to_time = function (num) {
        var output;
        if (num % 1 === 0) {
            output = num.toString() + ":00";
        }
        else {
            output = Math.floor(num).toString() + ":30";
        }
        return output;
    };
    return SchedulerController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SchedulerController;
//# sourceMappingURL=SchedulerController.js.map