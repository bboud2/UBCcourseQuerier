/**
 * Created by rtholmes on 2016-09-03.
 */

import Log from "../Util";
import JSZip = require('jszip');
import fs = require('fs');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Dataset;
}

/**
 * Representation of an object containing one or more courses
 */
export interface Dataset {
    [id: string]: Course;
}

/**
 * Represenation of a Course containing one or more sections
 */
export interface Course {
    dept: string;
    id: string;
    [section_id: number]: Section;
}

/**
 * Representation of a Section
 */
export interface Section {
    avg?: number;
    instructor?: string;
    title?: string;
    pass?: number;
    fail?: number;
    audit?: number;
}

export default class DatasetController {

    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');
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
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

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
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {

            let curr_dataset: any = that.getDataset(id);
            if (curr_dataset != null) {
                that.datasets[id] = curr_dataset;
                fulfill(true);
            }

            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    // TODO: wtf... html files?
                    let processedDataset: Dataset = {};
                    myZip.folder("courses").forEach(function (relativePath, file) {
                        let fileName: String = relativePath.replace(/^.*[\\\/]/, '');
                        let loc_firstDigit: number = fileName.search(/\d/);
                        let loc_period: number = fileName.search(".");
                        let dept: String = fileName.substring(0,loc_firstDigit);
                        let id: String = fileName.substring(loc_firstDigit, loc_period);
                        let curr: Course = JSONParser.parseCourse(dept, id, file);
                        processedDataset[curr.dept + curr.id] = curr;
                    });

                    that.save(id, processedDataset);
                    fulfill(true);
                }).catch(function (err) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
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
    private save(id: string, processedDataset: Dataset) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        let output: string = btoa(JSON.stringify(processedDataset));
        fs.write("./data/"+id+".json", output)

    }
}
