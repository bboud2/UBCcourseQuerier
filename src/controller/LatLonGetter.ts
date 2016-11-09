import {Room} from "./DatasetController";
var http = require("http");

export interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class latLonGetter {

    public static getLatLon(address: string, rooms: Room[]): Promise<boolean> {
        return new Promise(function (fulfill, reject) {
            //https://davidwalsh.name/nodejs-http-request
            http.get("http://skaha.cs.ubc.ca:8022/api/v1/team28/" + address, function(res: any)
            {
                var body: string = '';
                res.on('data', function(chunk: any) {
                    body += chunk;
                }).on('end', function() {
                    let geo: GeoResponse = JSON.parse(body);
                    if (geo.hasOwnProperty("error")) {
                        reject(geo.error);
                    } else {
                        rooms.forEach(function(curr: Room) {
                            curr.lat = geo.lat;
                            curr.lon = geo.lon;
                        });
                        fulfill(true);
                    }
                });
            }).on("error", function(e: any) {
                reject(e);
            });
        });
    }

}