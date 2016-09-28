/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');
import JsonParser from "./JSONParser";

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    sets: Dataset[];
}

/**
 * Representation of an object containing one or more courses
 */
export interface Dataset {
    id_key: String;
    courses: Course[];
}

/**
 * Represenation of a Course
 */
export interface Course {
    id_key: string;
    dept: string;
    course_num: string;
    sections: Section[];
}

/**
 * Representation of a Section
 */
export interface Section {
    avg?: number;
    professor?: string;
    title?: string;
    pass?: number;
    fail?: number;
    audit?: number;
}

export default class DatasetController {
    /**
     * All of the datasets that are in memory
     * @type {{}}
     */
    public datasets: Datasets = {sets: []};

    constructor() {
    }

    private static containsID(array: any[], id: String): boolean {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id_key == id) {
                return true;
            }
        }
        return false;
    }

    private static getElementFromId(array: any[], id: String): any {
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
        Log.trace("trying to get dataset");
        if (DatasetController.containsID(this.datasets.sets, id)) {
            Log.trace("dataset contains id");
            return DatasetController.getElementFromId(this.datasets.sets, id);
        } else {
            Log.trace("dataset does not contain id");
            var that = this;
            fs.readFile("./data/"+id+".json", function read(err, data) {
                if (err) {
                    return null;
                }
                that.load(id, data.toString());
                return DatasetController.getElementFromId(this.datasets.sets, id);
            });
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
        var files = fs.readdirSync("./data/");
        files.forEach( function(file, index ) {
            var data = fs.readFileSync("./data/"+file);
            that.load(file, data.toString());
        });
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
        Log.trace("process started");
        let that = this;
        return new Promise(function (fulfill, reject) {

            let curr_dataset: any = that.getDataset(id);
            if (curr_dataset != null) {
                fulfill(true);
            }

            try {
                Log.trace("new zip");
                let myZip = new JSZip();
                var processedDataset: Dataset = {id_key: id, courses: []};
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {

                    // TODO: wtf... html files?
                    var iter: number = 0;
                    var target: number = 0;
                    myZip.folder("courses").forEach(function (relativePath, file) {
                        target++;
                        Log.trace("new file");
                        let fileName: string = relativePath.replace(/^.*[\\\/]/, '');
                        let loc_firstDigit: number = fileName.search(/\d/);
                        let dept: string = fileName.substring(0,loc_firstDigit);
                        let course_num: string = fileName.substring(loc_firstDigit);
                        file.async("string").then(function success(content: any) {
                            processedDataset.courses.push(JsonParser.parseCourse(dept, course_num, content));
                        }, function error(e) {
                            Log.trace("couldn't get string from file with filename "+fileName)
                        }).then(function () {
                            iter++;
                            if (iter == target) {
                                Log.trace("saving dataset");
                                that.save(id, processedDataset);
                                fulfill(true);
                            }
                        });
                    });
                }).catch(function (err) {
                    reject(err);
                })
            } catch (err) {
                reject(err);
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
            oldDataset.courses = processedDataset.courses;
        } else {
            this.datasets.sets.push(processedDataset);
        }
        let output: string = JSON.stringify(processedDataset);
        fs.writeFileSync("./data/"+id+".json", output)
    }

    /**
     * Loads a previously processed dataset on disk into memory under the ID given by its file name.
     *
     * @param id
     * @param stringifiedDataset
     */
    private load(id: string, stringifiedDataset: string) {
        var newDataset: Dataset = {id_key: id, courses: JSON.parse(stringifiedDataset)};
        this.datasets.sets.push(newDataset);
    }
}
