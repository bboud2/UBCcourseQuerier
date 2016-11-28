"use strict";
var DatasetController_1 = require('../controller/DatasetController');
var QueryController_1 = require('../controller/QueryController');
var SchedulerController_1 = require('../controller/SchedulerController');
var Util_1 = require('../Util');
var fs = require('fs');
var DistanceAdder_1 = require("./DistanceAdder");
var InsightFacade = (function () {
    function InsightFacade() {
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        return new Promise(function (fufill, reject) {
            var wasSeenPrevious = InsightFacade.datasetAlreadyPresent(id);
            if (wasSeenPrevious) {
                InsightFacade.datasetController.process(id, content).then(function (result) {
                    Util_1.default.trace("201");
                    var res = {
                        code: 201,
                        body: { success: result }
                    };
                    fufill(res);
                }).catch(function (err) {
                    Util_1.default.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                    var res = {
                        code: 400,
                        error: err.toString()
                    };
                    reject(res);
                });
            }
            else {
                InsightFacade.datasetController.process(id, content).then(function (result) {
                    Util_1.default.trace("204");
                    var res = {
                        code: 204,
                        body: { success: result }
                    };
                    fufill(res);
                }).catch(function (err) {
                    Util_1.default.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                    var res = {
                        code: 400,
                        error: err.toString()
                    };
                    reject(res);
                });
            }
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        return new Promise(function (fufill, reject) {
            try {
                InsightFacade.datasetController.remove(id);
                var res = {
                    code: 204,
                    body: null
                };
                fufill(res);
            }
            catch (err) {
                var res = {
                    code: 404,
                    error: 'cant remove dataset: ' + err
                };
                reject(res);
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        return new Promise(function (fufill, reject) {
            try {
                var datasets = InsightFacade.datasetController.getDatasets();
                var controller = new QueryController_1.default(datasets);
                try {
                    var result = controller.query(query);
                    var res = {
                        code: 200,
                        body: result
                    };
                    fufill(res);
                }
                catch (err) {
                    if (err.ID == 400) {
                        var res = {
                            code: 400,
                            error: 'invalid query: ' + err.MESSAGE
                        };
                        reject(res);
                    }
                    else {
                        var res = {
                            code: 424,
                            error: 'invalid query: ' + err.MESSAGE
                        };
                        reject(res);
                    }
                }
            }
            catch (err) {
                Util_1.default.error('RouteHandler::postQuery(..) - ERROR: ' + err);
                var res = {
                    code: 400,
                    error: 'invalid query: ' + err
                };
                reject(res);
            }
        });
    };
    InsightFacade.datasetAlreadyPresent = function (id) {
        for (var i = 0; i < InsightFacade.datasetController.datasets.sets.length; i++) {
            var curr_dataset = InsightFacade.datasetController.datasets.sets[i];
            if (curr_dataset.id_key == id) {
                return true;
            }
        }
        try {
            fs.readFileSync("./data/" + id + ".json");
            return true;
        }
        catch (err) {
            return false;
        }
    };
    InsightFacade.prototype.performSchedule = function (messageObject) {
        return new Promise(function (fulfill, reject) {
            var controller = new SchedulerController_1.default(messageObject);
            var res = {
                code: 200,
                body: controller.do_scheduling()
            };
            fulfill(res);
        });
    };
    InsightFacade.prototype.performDistance = function (roomName) {
        return new Promise(function (fulfill, reject) {
            var dataset = InsightFacade.datasetController.getDataset("rooms");
            if (dataset == null) {
                var res_1 = {
                    code: 404,
                    error: "rooms dataset not found"
                };
                reject(res_1);
            }
            var adder = new DistanceAdder_1.default(dataset.rooms);
            var lat = null;
            var lon = null;
            for (var i = 0; i < dataset.rooms.length; i++) {
                var curr_room = dataset.rooms[i];
                if (curr_room.full_name == roomName) {
                    lat = curr_room.lat;
                    lon = curr_room.lon;
                    break;
                }
            }
            if (lat == null || lon == null) {
                var res_2 = {
                    code: 404,
                    error: "given room is missing either lat or lon data"
                };
                reject(res_2);
            }
            adder.addDistanceToCoordinate(lat, lon);
            var res = {
                code: 200,
                body: "Success!"
            };
            fulfill(res);
        });
    };
    InsightFacade.datasetController = new DatasetController_1.default();
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map