
export default class DistanceAdder {
    private rooms: any = null;

    constructor(rooms: any) {
        this.rooms = rooms;
    }

    public addDistanceToCoordinate(lat: number, lon: number) {
        this.rooms.forEach(function(room: any) {
            room.distance = DistanceAdder.calcDistance(room.lat, room.lon, lat, lon);
        });
    }

    // taken from: http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    private static calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }
        var p: number = 0.017453292519943295;    // Math.PI / 180
        var c: any = Math.cos;
        var a: number = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
        return (12742 * Math.asin(Math.sqrt(a))) * 1000; // 2 * R; R = 6371 km
    }
}