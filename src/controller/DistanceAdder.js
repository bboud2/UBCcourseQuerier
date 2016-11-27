"use strict";
var DistanceAdder = (function () {
    function DistanceAdder(rooms) {
        this.rooms = null;
        this.rooms = rooms;
    }
    DistanceAdder.prototype.addDistanceToCoordinate = function (lat, lon) {
        this.rooms.forEach(function (room) {
            room.distance = DistanceAdder.calcDistance(room.lat, room.lon, lat, lon);
        });
    };
    DistanceAdder.calcDistance = function (lat1, lon1, lat2, lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }
        var p = 0.017453292519943295;
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
        return (12742 * Math.asin(Math.sqrt(a))) * 1000;
    };
    return DistanceAdder;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DistanceAdder;
//# sourceMappingURL=DistanceAdder.js.map