/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import JsonParser from "./JSONParser";
import parse5 = require('parse5');
import {ASTNode} from "parse5";
import {ASTAttribute} from "parse5";
import HTMLParser from "./HTMLParser";

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
                                        console.log(roomsToIndex);
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
                            that.save(id, processedDataset);
                            fulfill(true);
                        }).catch(function(err) {
                            reject("couldn't save the dataset");
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
            oldDataset.sections = processedDataset.sections;
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
