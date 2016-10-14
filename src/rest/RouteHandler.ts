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

    private static datasetAlreadyPresent(controller: DatasetController, id: string): boolean {
        for (let i = 0; i < controller.datasets.sets.length; i++) {
            let curr_dataset: any = controller.datasets.sets[i];
            if (curr_dataset.id_key == id) {
                return true;
            }
        }
        try {
            fs.readFileSync("./data/"+id+".json");
            return true;
        } catch (err) {
            return false;
        }
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                let controller = RouteHandler.datasetController;
                let wasSeenPrevious: boolean = RouteHandler.datasetAlreadyPresent(controller, id);
                if (wasSeenPrevious) {
                    // was seen previously
                    controller.process(id, req.body).then(function (result) {
                        Log.trace("201");
                        res.json(201, {success: result});
                        return next();
                    }).catch(function (err) {
                        Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                        res.json(400, {error: err.toString()});
                        //res.json(400, {failure: err.toString()});
                        return next();
                    });
                } else {
                    // new dataset
                    controller.process(id, req.body).then(function (result) {
                        Log.trace("204");
                        res.json(204, {success: result});
                        return next();
                    }).catch(function (err) {
                        Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                        res.json(400, {error: err.toString()});
                        //res.json(400, {failure: err.toString()});
                        return next();
                    });
                }
            });
        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err);
            res.json(400, {error: err});
            return next();
        }
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let query: QueryRequest = req.params;
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            let controller = new QueryController(datasets);

            try {
                let result = controller.query(query);
                res.json(200, result);
            } catch (err) {
                if (err.ID == 400) {
                    res.json(400, {error: 'invalid query: ' + err.MESSAGE});
                } else {
                    res.json(424, {error: 'invalid query: ' + err.MESSAGE});
                }
            }
        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
            res.json(400, {error: 'invalid query: ' + err});
        }
        return next();
    }


    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::deleteDataset(..) - params: '+ JSON.stringify(req.params));
        try{
            let id: string = req.params.id;
            RouteHandler.datasetController.remove(id);
            res.json(204);
        }
        catch (err){
            res.json(404, {error: 'cant remove dataset: ' + err});
        }
        return next();
    }
}
