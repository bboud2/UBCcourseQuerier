"use strict";
var JSZip = require('jszip');
var fs = require('fs');
var JSONParser_1 = require("./JSONParser");
var HTMLParser_1 = require("./HTMLParser");
var OperatorHelpers_1 = require("./OperatorHelpers");
var DatasetController = (function () {
    function DatasetController() {
        this.datasets = { sets: [] };
    }
    DatasetController.containsID = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id_key == id) {
                return true;
            }
        }
        return false;
    };
    DatasetController.getElementFromId = function (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id_key == id) {
                return array[i];
            }
        }
        return null;
    };
    DatasetController.prototype.getDataset = function (id) {
        if (DatasetController.containsID(this.datasets.sets, id)) {
            return DatasetController.getElementFromId(this.datasets.sets, id);
        }
        else {
            var that = this;
            try {
                fs.readFile("./data/" + id + ".json", function read(err, data) {
                    if (err) {
                        return null;
                    }
                    that.load(data.toString());
                    return DatasetController.getElementFromId(that.datasets.sets, id);
                });
            }
            catch (err) {
                return null;
            }
            return null;
        }
    };
    DatasetController.prototype.getDatasets = function () {
        if (this.datasets.sets.length > 0) {
            return this.datasets;
        }
        var that = this;
        try {
            var files = fs.readdirSync("./data/");
            for (var i = 0; i < files.length; i++) {
                that.load(fs.readFileSync("./data/" + files[i]).toString());
            }
        }
        catch (err) {
            this.datasets = { sets: [] };
        }
        return this.datasets;
    };
    DatasetController.prototype.process = function (id, data) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                var myZip = new JSZip();
                myZip.loadAsync(data, { base64: true }).then(function (zip) {
                    if (id == "rooms") {
                        var processedDataset = { id_key: id, rooms: [] };
                    }
                    else {
                        var regObject = new RegExp(id);
                        var processedDataset = { id_key: id, sections: [] };
                        if (zip.folder(regObject).length == 0) {
                            reject("folder in dataset corresponding to dataset ID does not exist");
                        }
                    }
                    var files = [];
                    if (id == "rooms") {
                        var parser_1 = new HTMLParser_1.default();
                        var foundIndex_1 = false;
                        zip.forEach(function (relativePath, file) {
                            if (file.name == "index.htm") {
                                foundIndex_1 = true;
                                file.async("string").then(function (content) {
                                    HTMLParser_1.default.parseIndex(content).then(function (roomsToIndex) {
                                        zip.folder("campus").folder("discover").folder("buildings-and-classrooms").forEach(function (relativePath, file) {
                                            var shortenedFileName = file.name.substring(41);
                                            if (roomsToIndex.indexOf(shortenedFileName) != -1) {
                                                files.push(new Promise(function (fulfill, reject) {
                                                    file.async("string").then(function (content) {
                                                        parser_1.parseRooms(content, shortenedFileName).then(function (rooms) {
                                                            processedDataset.rooms = processedDataset.rooms.concat(rooms);
                                                            fulfill(true);
                                                        }).catch(function (error) {
                                                            reject(error);
                                                        });
                                                    }).catch(function error() {
                                                        reject("couldn't process individual room");
                                                    });
                                                }));
                                            }
                                        });
                                        Promise.all(files).then(function () {
                                            that.save(id, processedDataset);
                                            fulfill(true);
                                        }).catch(function (err) {
                                            reject("couldn't save the dataset");
                                        });
                                    }).catch(function (err) {
                                        reject("parseIndex threw an error");
                                    });
                                }).catch(function (err) {
                                    reject("index.html could not be asynced by jszip");
                                });
                            }
                        });
                        if (!foundIndex_1) {
                            reject("index.html not found");
                        }
                    }
                    else {
                        var parser_2 = new JSONParser_1.default();
                        zip.folder(id).forEach(function (relativePath, file) {
                            files.push(new Promise(function (fulfill, reject) {
                                file.async("string").then(function (content) {
                                    processedDataset.sections = processedDataset.sections.concat(parser_2.parseCourse(content));
                                    fulfill(true);
                                }).catch(function error() {
                                    reject(error);
                                });
                            }));
                        });
                        Promise.all(files).then(function () {
                            that.populateProfessors(processedDataset.sections).then(function (instructors) {
                                var processedDataset2 = { id_key: "instructors", instructors: instructors };
                                that.save(id, processedDataset);
                                that.save("instructors", processedDataset2);
                                fulfill(true);
                            });
                        }).catch(function (err) {
                            reject("can't save " + err);
                        });
                    }
                }).catch(function (err) {
                    reject("couldn't read from zip");
                });
            }
            catch (err) {
                reject("this error should never be reached");
            }
        });
    };
    DatasetController.prototype.populateProfessors = function (sections) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            var instructors = [];
            var filtered_sections = sections.filter(function (section) {
                return section.hasOwnProperty("professor") && section.professor != "" && section.professor != "tba" && section.professor.indexOf(";") == -1 && section.professor.indexOf("*") == -1 && section.professor.indexOf("-") == -1 && section.professor.indexOf(".") == -1;
            });
            filtered_sections.sort(OperatorHelpers_1.default.dynamicSort(["professor"], true));
            var last_professor_name = "";
            var last_professor = null;
            var rmps = [];
            for (var i = 0; i < filtered_sections.length; i++) {
                var curr_section = filtered_sections[i];
                var rmp_name = curr_section.professor.substr(curr_section.professor.indexOf(",") + 2) + " " + curr_section.professor.substr(0, curr_section.professor.indexOf(","));
                var tmp = rmp_name.split(" ").filter(function (string) {
                    return string.length > 1;
                });
                var curr_professor_name = tmp[0] + " " + tmp[tmp.length - 1];
                if (curr_professor_name == last_professor_name) {
                    last_professor.numSections += 1;
                    last_professor.totalStudents += curr_section.size;
                    last_professor.totalPassers += curr_section.pass;
                    last_professor.totalFailures += curr_section.fail;
                    last_professor.totalAuditors += curr_section.audit;
                    last_professor.studentAvg = (last_professor.studentAvg * (last_professor.totalStudents - curr_section.size) / last_professor.totalStudents) +
                        (curr_section.avg * (curr_section.size / last_professor.totalStudents));
                    last_professor.passPercentage = (last_professor.passPercentage * (last_professor.totalStudents - curr_section.size) / last_professor.totalStudents) +
                        (curr_section.pass / (curr_section.pass + curr_section.fail) * (curr_section.size / last_professor.totalStudents));
                    last_professor.studentSuccessMetric = last_professor.studentAvg - 25 * (1 - last_professor.passPercentage);
                }
                else {
                    if (last_professor_name != "") {
                        instructors.push(last_professor);
                    }
                    last_professor = {
                        id_key: instructors.length.toString(),
                        name: curr_professor_name,
                        department: curr_section.dept,
                        numSections: 1,
                        numCourses: 1,
                        totalStudents: curr_section.size,
                        totalPassers: curr_section.pass,
                        totalFailures: curr_section.fail,
                        totalAuditors: curr_section.audit,
                        studentAvg: curr_section.avg,
                        passPercentage: curr_section.pass / (curr_section.pass + curr_section.fail),
                        studentSuccessMetric: curr_section.avg - (25 * (1 - (curr_section.pass / (curr_section.pass + curr_section.fail)))),
                        rmpQuality: -1,
                        rmpEasiness: -1,
                        rmpHelpfulness: -1,
                        rmpChili: ""
                    };
                    last_professor_name = curr_professor_name;
                }
            }
            instructors.sort(OperatorHelpers_1.default.dynamicSort(["totalStudents"], false));
            for (var i = 0; i < instructors.length / 10; i++) {
                rmps.push(that.addRMP(instructors[i]));
            }
            Promise.all(rmps).then(function () {
                fulfill(instructors);
            });
        });
    };
    DatasetController.prototype.addRMP = function (instructor) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            console.log("attempting to add RMP for: " + instructor.name);
            var rmp = require("rmp-api");
            var ubc = rmp("University of British Columbia");
            ubc.get(instructor.name, function (professor) {
                if (professor !== null) {
                    console.log("it worked for: " + instructor.name);
                    instructor.rmpQuality = professor.quality;
                    instructor.rmpEasiness = professor.easiness;
                    instructor.rmpHelpfulness = professor.help;
                    instructor.rmpChili = professor.chili;
                }
                else {
                    console.log("it didn't work for: " + instructor.name);
                }
                fulfill(true);
            });
        });
    };
    DatasetController.prototype.save = function (id, processedDataset) {
        if (DatasetController.containsID(this.datasets.sets, id)) {
            var oldDataset = DatasetController.getElementFromId(this.datasets.sets, id);
            oldDataset.id_key = processedDataset.id_key;
            if (oldDataset.hasOwnProperty("sections")) {
                oldDataset.sections = processedDataset.sections;
            }
            else if (oldDataset.hasOwnProperty(("instructors"))) {
                oldDataset.instructors = processedDataset.instructors;
            }
            else {
                oldDataset.rooms = processedDataset.rooms;
            }
        }
        else {
            this.datasets.sets.push(processedDataset);
        }
        var output = JSON.stringify(processedDataset);
        try {
            fs.statSync("./data");
        }
        catch (err) {
            fs.mkdirSync("./data");
        }
        fs.writeFileSync("./data/" + id + ".json", output);
    };
    DatasetController.prototype.remove = function (id) {
        fs.unlinkSync("./data/" + id + ".json");
        for (var i = 0; i < this.datasets.sets.length; i++) {
            var trueSet = this.datasets.sets[i];
            if (trueSet.id_key == id) {
                this.datasets.sets.splice(i, 1);
                break;
            }
        }
        if (id == "courses") {
            this.remove("instructors");
        }
    };
    DatasetController.prototype.load = function (stringifiedDataset) {
        var newDataset = JSON.parse(stringifiedDataset);
        this.datasets.sets.push(newDataset);
    };
    return DatasetController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DatasetController;
//# sourceMappingURL=DatasetController.js.map