"use strict";
var fs = require('fs');
var Util_1 = require('../Util');
var InsightFacade_1 = require("../controller/InsightFacade");
var RouteHandler = (function () {
    function RouteHandler() {
    }
    RouteHandler.getHomepage = function (req, res, next) {
        Util_1.default.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    };
    RouteHandler.putDataset = function (req, res, next) {
        try {
            var id = req.params.id;
            var buffer_1 = [];
            req.on('data', function onRequestData(chunk) {
                buffer_1.push(chunk);
            });
            req.once('end', function () {
                var concated = Buffer.concat(buffer_1);
                req.body = concated.toString('base64');
                RouteHandler.insightFacade.addDataset(id, req.body).then(function (result) {
                    res.json(result.code, result.body);
                }).catch(function (result) {
                    res.json(result.code, { error: result['error'] });
                });
            });
        }
        catch (err) {
            Util_1.default.error('RouteHandler::postDataset(..) - ERROR: ' + err);
            res.json(400, { error: err });
            return next();
        }
    };
    RouteHandler.putDistance = function (req, res, next) {
        var name = req.params.name;
        RouteHandler.insightFacade.performDistance(name).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            res.json(result.code, { error: result['error'] });
        });
    };
    RouteHandler.postQuery = function (req, res, next) {
        RouteHandler.insightFacade.performQuery(req.params).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            res.json(result.code, { error: result['error'] });
        });
    };
    RouteHandler.postSchedule = function (req, res, next) {
        RouteHandler.insightFacade.performSchedule(req.params).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            res.json(result.code, { error: result['error'] });
        });
    };
    RouteHandler.deleteDataset = function (req, res, next) {
        Util_1.default.trace('RouteHandler::deleteDataset(..) - params: ' + JSON.stringify(req.params));
        var id = req.params.id;
        RouteHandler.insightFacade.removeDataset(id).then(function (result) {
            res.json(result.code, result.body);
        }).catch(function (result) {
            res.json(result.code, { error: result['error'] });
        });
        return next();
    };
    RouteHandler.insightFacade = new InsightFacade_1.default;
    return RouteHandler;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RouteHandler;
//# sourceMappingURL=RouteHandler.js.map