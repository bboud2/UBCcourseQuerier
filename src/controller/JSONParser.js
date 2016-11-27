"use strict";
var JsonParser = (function () {
    function JsonParser() {
        this.next_id = 0;
    }
    JsonParser.prototype.parseCourse = function (course) {
        var courseJSON = JSON.parse(course);
        var num_sections = courseJSON.result.length;
        var return_sections = [];
        for (var i = 0; i < num_sections; i++) {
            return_sections.push(this.parseSection(courseJSON.result[i]));
        }
        return return_sections;
    };
    JsonParser.prototype.parseSection = function (section) {
        var returnSection = {
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
        try {
            returnSection.dept = section.Subject;
        }
        catch (err) { }
        try {
            returnSection.course_num = section.Course;
        }
        catch (err) { }
        try {
            returnSection.section_id = section.id.toString();
        }
        catch (err) { }
        try {
            returnSection.avg = section.Avg;
        }
        catch (err) { }
        try {
            returnSection.professor = section.Professor;
        }
        catch (err) { }
        try {
            returnSection.title = section.Title;
        }
        catch (err) { }
        try {
            returnSection.pass = section.Pass;
            returnSection.size = parseInt(section.Pass);
        }
        catch (err) { }
        try {
            returnSection.fail = section.Fail;
            if (returnSection.size == null) {
                returnSection.size = section.Fail;
            }
            else {
                returnSection.size += parseInt(section.Fail);
            }
        }
        catch (err) { }
        try {
            returnSection.audit = section.Audit;
        }
        catch (err) { }
        try {
            if (section.Section == "overall") {
                returnSection.year = 1900;
            }
            else {
                returnSection.year = section.Year;
            }
        }
        catch (err) { }
        this.next_id++;
        return returnSection;
    };
    return JsonParser;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JsonParser;
//# sourceMappingURL=JSONParser.js.map