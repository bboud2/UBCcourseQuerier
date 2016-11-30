/**
 * Created by rtholmes on 2016-09-03.
 */

import JSZip = require('jszip');
import fs = require('fs');
import JsonParser from "./JSONParser";
import parse5 = require('parse5');
import HTMLParser from "./HTMLParser";
import OperatorHelpers from "./OperatorHelpers";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    sets: Dataset[];
}

/**
 * Representation of an object containing one or more sections
 */
export interface Dataset {
    id_key: string;
    sections?: Section[];
    instructors?: Instructor[];
    rooms?: Room[];
}

/**
 * Representation of a Section
 */
export interface Section {
    id_key: string;
    dept?: string;
    course_num?: string;
    section_id?: string;
    avg?: number;
    professor?: string;
    title?: string;
    pass?: number;
    fail?: number;
    audit?: number;
    year?: number;
    size?: number;
}

/**
 * Representation of an instructor
 */
export interface Instructor {
    id_key: string;
    name: string;
    department: string;
    numSections: number;
    numCourses: number;
    totalStudents: number;
    totalPassers: number;
    totalFailures: number;
    totalAuditors: number;
    studentAvg: number;
    passPercentage: number;
    studentSuccessMetric: number;
    rmpQuality: number;
    rmpHelpfulness: number,
    rmpEasiness: number,
    rmpChili: string,
}

/**
 * Representation of a Room
 */
export interface Room {
    id_key: string;
    full_name?: string;
    short_name?: string;
    number?: string;
    name?: string;
    address?: string;
    lat?: number;
    lon?: number;
    seats?: number;
    type?: string;
    furniture?: string;
    href?: string;
    distance?: number;
}

export default class DatasetController {
    /**
     * All of the datasets that are in memory
     * @type {{}}
     */
    public datasets: Datasets = {sets: []};

    constructor() {
    }

    private static containsID(array: any[], id: string): boolean {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id_key == id) {
                return true;
            }
        }
        return false;
    }

    private static getElementFromId(array: any[], id: string): any {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id_key == id) {
                return array[i];
            }
        }
        return null;
    }


    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        if (DatasetController.containsID(this.datasets.sets, id)) {
            return DatasetController.getElementFromId(this.datasets.sets, id);
        } else {
            var that = this;
            try {
                fs.readFile("./data/"+id+".json", function read(err, data) {
                    if (err) {
                        return null;
                    }
                    that.load(data.toString());
                    return DatasetController.getElementFromId(that.datasets.sets, id);
                });
            } catch (err) {
                return null;
            }
            return null;
        }

    }

    /**
     * Returns all datasets in memory, or if none, loads all possible datasets from disk and returns them
     * @returns {Datasets}
     */
    public getDatasets(): Datasets {
        if (this.datasets.sets.length > 0 ) {
            return this.datasets;
        }
        var that = this;
        try {
            var files = fs.readdirSync("./data/");
            for (let i = 0; i < files.length; i++) {
                that.load(fs.readFileSync("./data/"+files[i]).toString());
            }

        } catch (err) {
            this.datasets = {sets: []};
        }
        return this.datasets;
    }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    if (id == "rooms") {
                        var processedDataset: Dataset = {id_key: id, rooms: []};
                    } else {
                        var regObject: RegExp = new RegExp(id);
                        var processedDataset: Dataset = {id_key: id, sections: []};
                        if (zip.folder(regObject).length == 0) {
                            reject("folder in dataset corresponding to dataset ID does not exist");
                        }
                    }
                    var files: Promise<boolean>[] = [];
                    if (id == "rooms") {
                        let parser: any = new HTMLParser();
                        let foundIndex: boolean = false;
                        // look for index.html
                        zip.forEach(function (relativePath, file) {
                            if (file.name == "index.htm") {
                                foundIndex = true;
                                // read index.html to generate a list of acceptable rooms, and then parse those rooms
                                file.async("string").then(function (content: string) {
                                    HTMLParser.parseIndex(content).then(function (roomsToIndex: string[]) {
                                        zip.folder("campus").folder("discover").folder("buildings-and-classrooms").forEach(function (relativePath, file) {
                                            let shortenedFileName: string = file.name.substring(41); //deletes all the parent directories from the filename
                                            if (roomsToIndex.indexOf(shortenedFileName) != -1) {
                                                files.push(new Promise(function (fulfill, reject) {
                                                    file.async("string").then(function (content: any) {
                                                        // need to pass the current file name, the lat/long, and the html file
                                                        parser.parseRooms(content, shortenedFileName).then(function (rooms: Room[]) {
                                                            processedDataset.rooms = processedDataset.rooms.concat(rooms);
                                                            fulfill(true);
                                                        }).catch(function (error: string) {
                                                            reject(error);
                                                        });
                                                    }).catch(function error() {
                                                        reject("couldn't process individual room");
                                                    });
                                                }));
                                            }
                                        });
                                        Promise.all(files).then(function() {
                                            that.save(id, processedDataset);
                                            fulfill(true);
                                        }).catch(function(err) {
                                            reject("couldn't save the dataset");
                                        });
                                    }).catch(function(err: any) {
                                        reject("parseIndex threw an error");
                                    });
                                }).catch(function(err: any) {
                                    reject("index.html could not be asynced by jszip");
                                });
                            }
                        });
                        if (!foundIndex) {
                            reject("index.html not found");
                        }
                    } else {
                        let parser: any = new JsonParser();
                        zip.folder(id).forEach(function (relativePath, file) {
                            files.push(new Promise(function (fulfill, reject) {
                                file.async("string").then(function (content: string) {
                                    processedDataset.sections = processedDataset.sections.concat(parser.parseCourse(content));
                                    fulfill(true);
                                }).catch(function error() {
                                    reject(error);
                                });
                            }));
                        });
                        Promise.all(files).then(function() {
                            that.populateProfessors(processedDataset.sections).then(function(instructors) {
                                let processedDataset2: Dataset = {id_key: "instructors", instructors: instructors};
                                that.save(id, processedDataset);
                                that.save("instructors", processedDataset2);
                                fulfill(true);
                            });
                        }).catch(function(err) {
                            reject("can't save " + err);
                        });
                    }
                }).catch(function (err) {
                    reject("couldn't read from zip");
                })
            } catch (err) {
                reject("this error should never be reached");
            }
        });
    }

    private populateProfessors(sections: Section[]): Promise<Instructor[]> {
        let that = this;
        return new Promise(function(fulfill, reject) {
            let instructors: Instructor[] = [];
            let filtered_sections: Section[] = sections.filter(function(section): boolean {
                return section.hasOwnProperty("professor") && section.professor != "" && section.professor != "tba" && section.professor.indexOf(";") == -1 && section.professor.indexOf("*") == -1 && section.professor.indexOf("-") == -1 && section.professor.indexOf(".") == -1;
            });
            filtered_sections.sort(OperatorHelpers.dynamicSort(["professor"], true));
            let last_professor_name: string = "";
            let last_professor: Instructor = null;
            let rmps: Promise<boolean>[] = [];
            for (let i = 0; i < filtered_sections.length; i++) {
                let curr_section: Section = filtered_sections[i];
                let rmp_name = curr_section.professor.substr(curr_section.professor.indexOf(",") + 2) + " " + curr_section.professor.substr(0, curr_section.professor.indexOf(","));
                let tmp = rmp_name.split(" ").filter(function(string): boolean {
                    return string.length > 1;
                });
                let curr_professor_name: string = tmp[0] + " " + tmp[tmp.length - 1];
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
                } else {
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
            instructors.sort(OperatorHelpers.dynamicSort(["totalStudents"], false));
            for (let i = 0; i < instructors.length / 10; i++) {
                rmps.push(that.addRMP(instructors[i]));
            }
            Promise.all(rmps).then(function () {
                fulfill(instructors);
            });
        });
    }

    private addRMP(instructor: Instructor): Promise<boolean> {
        let that: any = this;
        // return new Promise(function (fulfill, reject) {
        //     fulfill(true);
        // });
        return new Promise(function (fulfill, reject) {
            console.log("attempting to add RMP for: " + instructor.name);
            var rmp = require("rmp-api");
            var ubc = rmp("University of British Columbia");
            ubc.get(instructor.name, function(professor: any) {
                if (professor !== null) {
                    console.log("it worked for: " + instructor.name);
                    instructor.rmpQuality = professor.quality;
                    instructor.rmpEasiness = professor.easiness;
                    instructor.rmpHelpfulness = professor.help;
                    instructor.rmpChili = professor.chili;
                } else {
                    console.log("it didn't work for: " + instructor.name);
                }
                fulfill(true);
            });
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    public save(id: string, processedDataset: Dataset) {
        if (DatasetController.containsID(this.datasets.sets, id)) {
            let oldDataset: Dataset = DatasetController.getElementFromId(this.datasets.sets, id);
            oldDataset.id_key = processedDataset.id_key;
            if (oldDataset.hasOwnProperty("sections")) {
                oldDataset.sections = processedDataset.sections;
            } else if (oldDataset.hasOwnProperty(("instructors"))) {
                oldDataset.instructors = processedDataset.instructors;
            } else {
                oldDataset.rooms = processedDataset.rooms;
            }
        } else {
            this.datasets.sets.push(processedDataset);
        }
        let output: string = JSON.stringify(processedDataset);
        try {
            fs.statSync("./data");
        } catch (err) {
            fs.mkdirSync("./data");
        }
        fs.writeFileSync("./data/"+id+".json", output);
    }

    public remove(id:string) {
        fs.unlinkSync("./data/" + id + ".json");
        for (let i = 0; i < this.datasets.sets.length; i ++) {
            let trueSet: Dataset = this.datasets.sets[i];
            if (trueSet.id_key == id) {
                this.datasets.sets.splice(i, 1);
                break;
            }
        }
        if(id == "courses") {
            this.remove("instructors");
        }
    }

    /**
     * Loads a previously processed dataset on disk into memory under the ID given by its file name.
     *
     * @param id
     * @param stringifiedDataset
     */
    private load(stringifiedDataset: string) {
        var newDataset: Dataset = JSON.parse(stringifiedDataset);
        this.datasets.sets.push(newDataset);
    }
}
