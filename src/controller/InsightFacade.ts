/**
 * Created by Ben on 10/14/2016.
 */
/**
 * Created by Ben on 10/14/2016.
 */

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';
import SchedulerController from '../controller/SchedulerController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import fs = require('fs');
import {Dataset} from "./DatasetController";
import DistanceAdder from "./DistanceAdder";

export default class InsightFacade implements IInsightFacade {


    private static datasetController = new DatasetController();

    addDataset(id: string, content: string): Promise<InsightResponse>{
        return new Promise<InsightResponse>(function(fufill, reject){
            let wasSeenPrevious: boolean = InsightFacade.datasetAlreadyPresent(id);
            if(wasSeenPrevious){
                //Dataset already exists within datasetController -> 201 code
                InsightFacade.datasetController.process(id,content).then(function (result:any){
                    Log.trace("201");
                    let res:InsightResponse =  {
                        code: 201,
                        body: {success: result}
                    };
                    fufill(res);
                }).catch(function (err:any){
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                    let res:InsightResponse =  {
                        code: 400,
                        error: err.toString()
                    };
                    reject(res);
                })
            }
            else{
                //Create a new Dataset to insert
                InsightFacade.datasetController.process(id,content).then(function (result:any){
                    Log.trace("204");
                    let res:InsightResponse =  {
                        code: 204,
                        body: {success: result}
                    };
                    fufill(res);

                }).catch(function (err:any){
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.toString());
                    let res:InsightResponse =  {
                        code: 400,
                        error: err.toString()
                    };
                    reject(res);
                })
            }
        });
    }

    removeDataset(id: string): Promise<InsightResponse>{
        return new Promise<InsightResponse>(function (fufill, reject){

            try{
                InsightFacade.datasetController.remove(id);
                let res:InsightResponse = {
                    code: 204,
                    body: null
                };
                fufill(res);
            }
            catch (err){
                let res:InsightResponse = {
                    code: 404,
                    error: 'cant remove dataset: ' + err
                };
                reject(res);
            }

        });
    }

    performQuery(query: QueryRequest): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (fufill,reject){
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller = new QueryController(datasets);

                try {
                    let result = controller.query(query);
                    let res:InsightResponse = {
                        code:200,
                        body:result
                    };
                    fufill(res);
                } catch (err) {
                    if (err.ID == 400) {
                        let res:InsightResponse = {
                            code: 400,
                            error: 'invalid query: ' + err.MESSAGE
                        };
                        reject(res);
                    } else {
                        let res:InsightResponse = {
                            code: 424,
                            error: 'invalid query: ' + err.MESSAGE
                        };
                        reject(res);
                    }
                }
            } catch (err) {
                Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
                let res:InsightResponse = {
                    code:400,
                    error: 'invalid query: ' + err
                };
                reject(res);
            }
        })

    }


    public static datasetAlreadyPresent(id: string): boolean {
        for (let i = 0; i < InsightFacade.datasetController.datasets.sets.length; i++) {
            let curr_dataset: any = InsightFacade.datasetController.datasets.sets[i];
            if (curr_dataset.id_key == id) {
                return true;
            }
        }
        try {
            fs.readFileSync("./data/"+id+".json");
            return true;
        }    catch (err) {
            return false;
        }
    }

    performSchedule(messageObject: any): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (fulfill, reject) {
            let controller = new SchedulerController(messageObject);
            let res:InsightResponse = {
                code: 200,
                body: controller.do_scheduling()
            };
            fulfill(res);
        });
    }

    performDistance(roomName: string): Promise<InsightResponse> {
        return new Promise<InsightResponse>(function (fulfill, reject) {
            let dataset: Dataset = InsightFacade.datasetController.getDataset("rooms");
            if (dataset == null) {
                let res:InsightResponse = {
                    code: 404,
                    error: "rooms dataset not found"
                };
                reject(res);
            }
            let adder: DistanceAdder = new DistanceAdder(dataset.rooms);
            let lat: number = null;
            let lon: number = null;
            for (let i = 0; i < dataset.rooms.length; i++) {
                let curr_room: any = dataset.rooms[i];
                if (curr_room.full_name == roomName) {
                    lat = curr_room.lat;
                    lon = curr_room.lon;
                    break;
                }
            }
            if (lat == null || lon == null) {
                let res:InsightResponse = {
                    code: 404,
                    error: "given room is missing either lat or lon data"
                };
                reject(res);
            }
            adder.addDistanceToCoordinate(lat, lon);
            let res:InsightResponse = {
                code: 200,
                body: "Success!"
            };
            fulfill(res);
        });
    }

}
