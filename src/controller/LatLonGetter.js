"use strict";
var http = require("http");
var latLonGetter = (function () {
    function latLonGetter() {
    }
    latLonGetter.getLatLon = function (address, rooms) {
        return new Promise(function (fulfill, reject) {
            http.get("http://skaha.cs.ubc.ca:8022/api/v1/team28/" + address, function (res) {
                var body = '';
                res.on('data', function (chunk) {
                    body += chunk;
                }).on('end', function () {
                    var geo = JSON.parse(body);
                    if (geo.hasOwnProperty("error")) {
                        reject(geo.error);
                    }
                    else {
                        rooms.forEach(function (curr) {
                            curr.lat = geo.lat;
                            curr.lon = geo.lon;
                        });
                        fulfill(true);
                    }
                });
            }).on("error", function (e) {
                reject(e);
            });
        });
    };
    return latLonGetter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = latLonGetter;
//# sourceMappingURL=LatLonGetter.js.map