"use strict";
var OperatorHelpers = (function () {
    function OperatorHelpers() {
    }
    OperatorHelpers.GreaterThan = function (object, field, value) {
        return object[field] > Number(value);
    };
    OperatorHelpers.LessThan = function (object, field, value) {
        return object[field] < Number(value);
    };
    OperatorHelpers.EqualTo = function (object, field, value) {
        return object[field] == Number(value);
    };
    OperatorHelpers.NotEqualTo = function (object, field, value) {
        return object[field] != Number(value);
    };
    OperatorHelpers.StringIsEqualTo = function (object, field, value) {
        return OperatorHelpers.compareStringsWithWildcards(object[field], value, false);
    };
    OperatorHelpers.StringIsNotEqualTo = function (object, field, value) {
        return OperatorHelpers.compareStringsWithWildcards(object[field], value, true);
    };
    OperatorHelpers.dynamicSort = function (fields, ascending) {
        var reverse = (ascending) ? 1 : -1;
        return function (a, b) {
            for (var f = 0; f < fields.length; f++) {
                if (a[fields[f]] < b[fields[f]]) {
                    return -1 * reverse;
                }
                else if (a[fields[f]] > b[fields[f]]) {
                    return reverse;
                }
            }
            return 0;
        };
    };
    OperatorHelpers.compareStringsWithWildcards = function (s1, s2, negated) {
        if (s2.includes("*")) {
            var s2Parts = s2.split("*");
            var is1 = 0;
            if (s2[0] !== "*") {
                is1 = s1.indexOf(s2Parts[0]);
                if (is1 !== 0) {
                    return negated;
                }
            }
            for (var i = 0; i < s2Parts.length; i++) {
                is1 = s1.indexOf(s2Parts[i], is1);
                if (is1 === -1) {
                    return negated;
                }
                is1 += s2Parts[i].length;
            }
            if (s2[s2.length - 1] !== "*") {
                if (s1.length != is1) {
                    return negated;
                }
            }
            return !negated;
        }
        else {
            if (s1.length != s2.length) {
                return negated;
            }
            for (var i = 0; i < s1.length; i++) {
                if (s1[i] !== s2[i]) {
                    return negated;
                }
            }
            return !negated;
        }
    };
    OperatorHelpers.compare_arrays = function (a, b) {
        return a.length - b.length;
    };
    OperatorHelpers.isFieldNumeric = function (field) {
        return (field === "avg" || field === "fail" || field === "pass" || field === "audit"
            || field === "lat" || field === "lon" || field === "seats" || field === "size" || field === "year"
            || field === "distance" || field === "numSections" || field === "numCourses" || field === "totalStudents"
            || field === "totalPassers" || field === "totalFailures" || field === "totalAuditors"
            || field === "studentAvg" || field === "passPercentage" || field === "studentSuccessMetric"
            || field === "rmpQuality" || field === "rmpHelpfulness" || field === "rmpEasiness");
    };
    OperatorHelpers.handle_max = function (objects, field) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw { ID: 400, MESSAGE: "Expected a numeric field for handle_max but got " + field };
        }
        var max_val = Number.MIN_SAFE_INTEGER;
        for (var s = 0; s < objects.length; s++) {
            var curr_object = objects[s];
            if (curr_object[field] > max_val) {
                max_val = curr_object[field];
            }
        }
        return max_val;
    };
    OperatorHelpers.handle_min = function (objects, field) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw { ID: 400, MESSAGE: "Expected a numeric field for handle_min but got " + field };
        }
        var min_val = Number.MAX_SAFE_INTEGER;
        for (var s = 0; s < objects.length; s++) {
            var curr_object = objects[s];
            if (curr_object[field] < min_val) {
                min_val = curr_object[field];
            }
        }
        return min_val;
    };
    OperatorHelpers.handle_avg = function (objects, field) {
        if (!OperatorHelpers.isFieldNumeric(field)) {
            throw { ID: 400, MESSAGE: "Expected a numeric field for handle_avg but got " + field };
        }
        var tally = 0.0;
        for (var s = 0; s < objects.length; s++) {
            var curr_object = objects[s];
            tally += curr_object[field];
        }
        return Number((tally / objects.length).toFixed(2));
    };
    OperatorHelpers.handle_count = function (objects, field) {
        var unique_finds = [];
        for (var s = 0; s < objects.length; s++) {
            var curr_object = objects[s];
            if (unique_finds.indexOf(curr_object[field]) == -1) {
                unique_finds.push(curr_object[field]);
            }
        }
        return unique_finds.length;
    };
    return OperatorHelpers;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OperatorHelpers;
//# sourceMappingURL=OperatorHelpers.js.map