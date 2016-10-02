/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';

export default class RouteHandler {

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                let controller = RouteHandler.datasetController;
                let wasSeenPrevious: any = controller.getDataset(id);
                if (wasSeenPrevious) {
                    controller.process(id, req.body).then(function (result) {
                        Log.trace('RouteHandler::postDataset(..) - processed');
                        res.json(201, {success: result});
                    }).catch(function (err: Error) {
                        Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                        res.json(400, {err: err.message});
                    });
                } else {
                    controller.process(id, req.body).then(function (result) {
                        Log.trace('RouteHandler::postDataset(..) - processed');
                        res.json(204, {success: result});
                    }).catch(function (err: Error) {
                        Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                        res.json(400, {err: err.message});
                    });
                }
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            let controller = new QueryController(datasets);

            try {
                let trueGet: any = [];
                if (typeof(query.GET) == "string") {
                    trueGet.push(query.GET);
                } else {
                    trueGet = query.GET;
                }
                var id: string = trueGet[0].substr(0, trueGet[0].indexOf("_"));
                let exists: boolean = false;
                for (let i = 0; i < datasets.sets.length; i++) {
                    if (datasets.sets[i].id_key == id) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    res.json(424, {missing: [id]})
                }
                let result = controller.query(query, id);
                res.json(200, result);
            } catch (err) {
                res.json(400, {status: 'invalid query: ' + err});
            }

        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
            res.send(403);
        }
        return next();
    }


    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::deleteDataset(..) - params: '+ JSON.stringify(req.params));
        try{
            let id: string = req.params.id;
            RouteHandler.datasetController.delete(id);
            res.json(204);
        }
        catch (err){
            res.json(404);
        }
        return next();
    }
}
