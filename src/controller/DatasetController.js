"use strict";
var JSZip = require('jszip');
var fs = require('fs');
var JSONParser_1 = require("./JSONParser");
var HTMLParser_1 = require("./HTMLParser");
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
                            that.save(id, processedDataset);
                            fulfill(true);
                        }).catch(function (err) {
                            reject("couldn't save the dataset");
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
    DatasetController.prototype.save = function (id, processedDataset) {
        if (DatasetController.containsID(this.datasets.sets, id)) {
            var oldDataset = DatasetController.getElementFromId(this.datasets.sets, id);
            oldDataset.id_key = processedDataset.id_key;
            oldDataset.sections = processedDataset.sections;
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