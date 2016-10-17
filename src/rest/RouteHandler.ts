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
import InsightFacade from "../controller/InsightFacade";
import {InsightResponse} from "../controller/IInsightFacade";

export default class RouteHandler {

    private static insightFacade = new InsightFacade;

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
                RouteHandler.insightFacade.addDataset(id,req.body).then(function (result){
                    res.json(result.code, result.body);
                }).catch(function (error){
                    res.json("this code should not be reachead");
                });

            });
        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err);
            res.json(400, {error: err});
            return next();
        }
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {

        RouteHandler.insightFacade.performQuery(req.params).then(function (result){
            res.json(result.code,result.body);
        });
    }


    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next){
        Log.trace('RouteHandler::deleteDataset(..) - params: '+ JSON.stringify(req.params));
        let id: string = req.params.id;
        RouteHandler.insightFacade.removeDataset(id).then(function (result){
            res.json(result.code,result.body);
        });
        return next();
    }
}
