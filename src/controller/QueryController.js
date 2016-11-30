"use strict";
var OperatorHelpers_1 = require("./OperatorHelpers");
var QueryController = (function () {
    function QueryController(datasets) {
        this.datasets = null;
        this.id = null;
        this.datasets = datasets;
    }
    QueryController.isValidKey = function (key, groupOrderExists, query) {
        if (groupOrderExists) {
            var foundKey = false;
            if (key.indexOf("_") == -1) {
                for (var i = 0; i < query.APPLY.length; i++) {
                    var currKey = Object.keys(query.APPLY[i])[0];
                    if (currKey == key) {
                        foundKey = true;
                        break;
                    }
                }
                if (!foundKey) {
                    throw { ID: 400, MESSAGE: "key: " + key + " was not found in APPLY" };
                }
            }
            else {
                for (var i = 0; i < query.GROUP.length; i++) {
                    var currKey = query.GROUP[i];
                    if (currKey == key) {
                        foundKey = true;
                        break;
                    }
                }
                if (!foundKey) {
                    throw { ID: 400, MESSAGE: "key: " + key + " was not found in GROUP" };
                }
            }
        }
        else {
            if (key.indexOf("_") == -1) {
                throw { ID: 400, MESSAGE: "Malformed dataset id: " + key };
            }
        }
    };
    QueryController.isValid = function (query) {
        var actualKeys = Object.keys(query).length;
        var expectedKeys = 3;
        var groupApplyStatus = false;
        if (query.hasOwnProperty("ORDER")) {
            expectedKeys++;
        }
        if (query.hasOwnProperty("GROUP")) {
            expectedKeys++;
            groupApplyStatus = !groupApplyStatus;
        }
        if (query.hasOwnProperty("APPLY")) {
            expectedKeys++;
            groupApplyStatus = !groupApplyStatus;
        }
        if (groupApplyStatus) {
            throw { ID: 400, MESSAGE: "One of GROUP/APPLY is present without the other GROUP/APPLY" };
        }
        if (actualKeys != expectedKeys) {
            throw { ID: 400, MESSAGE: (actualKeys - expectedKeys).toString() + " additional key(s) in query (negative number means keys are missing)" };
        }
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0 &&
            query.hasOwnProperty("GET") && query.hasOwnProperty("WHERE") && query.hasOwnProperty("AS")) {
            var trueGet = [];
            if (typeof (query.GET) == "string") {
                trueGet.push(query.GET);
            }
            else {
                trueGet = query.GET;
            }
            if (trueGet.length == 0) {
                throw { ID: 400, MESSAGE: "You have to GET something. Queries can't get nothing" };
            }
            for (var i = 0; i < trueGet.length; i++) {
                QueryController.isValidKey(trueGet[i], query.hasOwnProperty("GROUP"), query);
            }
            var oneUnderscore = false;
            for (var i = 0; i < trueGet.length; i++) {
                var curr_key = trueGet[i];
                if (curr_key.indexOf("_") != -1) {
                    oneUnderscore = true;
                    break;
                }
            }
            if (!oneUnderscore) {
                throw { ID: 400, MESSAGE: "No keys with an underscore so no dataset ID to look for" };
            }
            return true;
        }
        throw { ID: 400, MESSAGE: "Query is invalid" };
    };
    QueryController.prototype.getAllObjects = function (ids) {
        for (var j = 0; j < ids.length; j++) {
            if (ids[j].indexOf("_") != -1) {
                var id = ids[j].substr(0, ids[j].indexOf("_"));
                for (var i = 0; i < this.datasets.sets.length; i++) {
                    if (this.datasets.sets[i].id_key == id) {
                        this.id = id;
                        switch (id) {
                            case "courses":
                                return this.datasets.sets[i].sections;
                            case "instructors":
                                return this.datasets.sets[i].instructors;
                            case "rooms":
                                return this.datasets.sets[i].rooms;
                            default:
                                if (this.datasets.sets[i].hasOwnProperty("sections")) {
                                    return this.datasets.sets[i].sections;
                                }
                                else if (this.datasets.sets[i].hasOwnProperty("instructors")) {
                                    return this.datasets.sets[i].instructors;
                                }
                                else {
                                    return this.datasets.sets[i].rooms;
                                }
                        }
                    }
                }
            }
        }
        throw { ID: 424, MESSAGE: "dataset not found" };
    };
    QueryController.prototype.isIDUbiquitous = function (ids) {
        for (var j = 0; j < ids.length; j++) {
            if (ids[j].indexOf("_") != -1) {
                var curr_id = ids[j].substr(0, ids[j].indexOf("_"));
                if (curr_id != this.id) {
                    throw { ID: 400, MESSAGE: "multiple dataset IDs present" };
                }
            }
        }
    };
    QueryController.prototype.query = function (query) {
        QueryController.isValid(query);
        var trueGet = [];
        if (typeof (query.GET) == "string") {
            trueGet.push(query.GET);
        }
        else {
            trueGet = query.GET;
        }
        var allObjects = this.getAllObjects(trueGet);
        this.isIDUbiquitous(trueGet);
        var filteredObjects;
        var whereObject = query.WHERE;
        var operation = Object.keys(whereObject)[0];
        switch (Object.keys(whereObject).length) {
            case 0:
                filteredObjects = allObjects;
                break;
            case 1:
                filteredObjects = this.filterObjects(operation, whereObject[operation], allObjects, false);
                break;
            default:
                throw { ID: 400, MESSAGE: "Where has multiple initial keys" };
        }
        var filteredGroups = this.groupAndApply(filteredObjects, query.GROUP, query.APPLY, trueGet);
        var asType = query.AS;
        if (asType != "TABLE") {
            throw { ID: 400, MESSAGE: "Invalid type given for AS" };
        }
        if (query.hasOwnProperty("ORDER")) {
            if (typeof (query.ORDER) === "object") {
                var sObject = query.ORDER;
                if (Object.keys(sObject).length != 2 || !sObject.hasOwnProperty("dir") || !sObject.hasOwnProperty("keys")) {
                    throw { ID: 400, MESSAGE: "ORDER is an object (not a string) but isn't a valid sortObject" };
                }
                for (var i = 0; i < sObject["keys"].length; i++) {
                    if (trueGet.indexOf(sObject["keys"][i]) === -1) {
                        throw { ID: 400, MESSAGE: "Key for ORDER within ORDER.keys is not present in keys for GET" };
                    }
                }
            }
            else {
                if (trueGet.indexOf(query.ORDER) === -1) {
                    throw { ID: 400, MESSAGE: "Key for ORDER not present in keys for GET" };
                }
            }
            var orderedGroups = QueryController.orderGroups(filteredGroups, query.ORDER);
            var display_object = QueryController.displayGroups(orderedGroups, trueGet, asType);
        }
        else {
            var display_object = QueryController.displayGroups(filteredGroups, trueGet, asType);
        }
        return display_object;
    };
    QueryController.validateGroupAndApply = function (group, apply) {
        if (group.length == 0) {
            throw { ID: 400, MESSAGE: "GROUP cannot exist and be empty" };
        }
        for (var g = 0; g < group.length; g++) {
            for (var a = 0; a < apply.length; a++) {
                var applyObject = apply[a];
                var innerObject = applyObject[Object.keys(applyObject)[0]];
                var applyKey = innerObject[Object.keys(innerObject)[0]];
                if (group[g] == applyKey) {
                    throw { ID: 400, MESSAGE: "The following key was found in both apply and group: " + applyKey };
                }
            }
        }
    };
    QueryController.prototype.doGrouping = function (filteredObjects, group, get) {
        var filteredGroups = [];
        var sortedObjects = filteredObjects;
        var convertedFieldNames = [];
        for (var g = 0; g < group.length; g++) {
            convertedFieldNames.push(this.convertFieldNames(group[g]));
        }
        if (sortedObjects.length > 0) {
            sortedObjects = sortedObjects.sort(OperatorHelpers_1.default.dynamicSort(convertedFieldNames, true));
            var last = {};
            var currGroup = {};
            for (var s = 0; s < sortedObjects.length; s++) {
                var curr = sortedObjects[s];
                var same = true;
                for (var g = 0; g < group.length; g++) {
                    if (curr[this.convertFieldNames(group[g])] != last[this.convertFieldNames(group[g])]) {
                        same = false;
                        break;
                    }
                }
                if (!same) {
                    if (currGroup.hasOwnProperty("objects")) {
                        filteredGroups.push(JSON.parse(JSON.stringify(currGroup)));
                    }
                    currGroup = { objects: [curr] };
                    for (var g = 0; g < group.length; g++) {
                        currGroup[group[g]] = curr[this.convertFieldNames(group[g])];
                    }
                }
                else {
                    currGroup.objects.push(curr);
                }
                last = curr;
            }
            filteredGroups.push(currGroup);
        }
        return filteredGroups;
    };
    QueryController.getApplyFieldValue = function (group, opCode, field) {
        var handlerFunction;
        switch (opCode) {
            case "MAX":
                handlerFunction = OperatorHelpers_1.default.handle_max;
                break;
            case "MIN":
                handlerFunction = OperatorHelpers_1.default.handle_min;
                break;
            case "AVG":
                handlerFunction = OperatorHelpers_1.default.handle_avg;
                break;
            case "COUNT":
                handlerFunction = OperatorHelpers_1.default.handle_count;
                break;
            default:
                throw { ID: 400, MESSAGE: "Invalid opCode received on APPLY: " + opCode };
        }
        return handlerFunction(group.objects, field);
    };
    QueryController.prototype.doApplying = function (groups, apply) {
        for (var g = 0; g < groups.length; g++) {
            var currGroup = groups[g];
            for (var a = 0; a < apply.length; a++) {
                var currApplyObject = apply[a];
                var newFieldName = Object.keys(currApplyObject)[0];
                var innerApplyObject = currApplyObject[newFieldName];
                var opCode = Object.keys(innerApplyObject)[0];
                currGroup[newFieldName] = QueryController.getApplyFieldValue(currGroup, opCode, this.convertFieldNames(innerApplyObject[opCode]));
            }
            groups[g] = currGroup;
        }
        return groups;
    };
    QueryController.prototype.groupAndApply = function (filteredObjects, group, apply, get) {
        var filteredGroups = [];
        if (group == undefined) {
            for (var s = 0; s < filteredObjects.length; s++) {
                var curr = filteredObjects[s];
                var newGroup = { objects: [curr] };
                for (var k = 0; k < get.length; k++) {
                    var convertedField = this.convertFieldNames(get[k]);
                    newGroup[get[k]] = curr[convertedField];
                }
                filteredGroups.push(newGroup);
            }
            return filteredGroups;
        }
        QueryController.validateGroupAndApply(group, apply);
        filteredGroups = this.doGrouping(filteredObjects, group, get);
        return (this.doApplying(filteredGroups, apply));
    };
    QueryController.prototype.convertFieldNames = function (key) {
        key = key.replace("[", "");
        key = key.replace("]", "");
        if (this.id == "rooms") {
            switch (key) {
                case this.id + "_fullname":
                    key = "full_name";
                    break;
                case this.id + "_shortname":
                    key = "short_name";
                    break;
                case this.id + "_number":
                    key = "number";
                    break;
                case this.id + "_name":
                    key = "name";
                    break;
                case this.id + "_address":
                    key = "address";
                    break;
                case this.id + "_lat":
                    key = "lat";
                    break;
                case this.id + "_lon":
                    key = "lon";
                    break;
                case this.id + "_seats":
                    key = "seats";
                    break;
                case this.id + "_type":
                    key = "type";
                    break;
                case this.id + "_furniture":
                    key = "furniture";
                    break;
                case this.id + "_href":
                    key = "href";
                    break;
                case this.id + "_distance":
                    key = "distance";
                    break;
                default:
                    if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                        throw { ID: 400, MESSAGE: "key not corresponding to valid field: " + key };
                    }
                    throw { ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where" };
            }
        }
        else if (this.id == "instructors") {
            switch (key) {
                case this.id + "_name":
                    key = "name";
                    break;
                case this.id + "_department":
                    key = "department";
                    break;
                case this.id + "_numSections":
                    key = "numSections";
                    break;
                case this.id + "_numCourses":
                    key = "numCourses";
                    break;
                case this.id + "_totalStudents":
                    key = "totalStudents";
                    break;
                case this.id + "_totalPassers":
                    key = "totalPassers";
                    break;
                case this.id + "_totalFailures":
                    key = "totalFailures";
                    break;
                case this.id + "_totalAuditors":
                    key = "totalAuditors";
                    break;
                case this.id + "_studentAvg":
                    key = "studentAvg";
                    break;
                case this.id + "_passPercentage":
                    key = "passPercentage";
                    break;
                case this.id + "_studentSuccessMetric":
                    key = "studentSuccessMetric";
                    break;
                case this.id + "_rmpQuality":
                    key = "rmpQuality";
                    break;
                case this.id + "_rmpHelpfulness":
                    key = "rmpHelpfulness";
                    break;
                case this.id + "_rmpEasiness":
                    key = "rmpEasiness";
                    break;
                case this.id + "_rmpChili":
                    key = "rmpChili";
                    break;
                default:
                    if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                        throw { ID: 400, MESSAGE: "key not corresponding to valid field: " + key };
                    }
                    throw { ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where" };
            }
        }
        else {
            switch (key) {
                case this.id + "_dept":
                    key = "dept";
                    break;
                case this.id + "_id":
                    key = "course_num";
                    break;
                case this.id + "_uuid":
                    key = "section_id";
                    break;
                case this.id + "_avg":
                    key = "avg";
                    break;
                case this.id + "_instructor":
                    key = "professor";
                    break;
                case this.id + "_title":
                    key = "title";
                    break;
                case this.id + "_pass":
                    key = "pass";
                    break;
                case this.id + "_fail":
                    key = "fail";
                    break;
                case this.id + "_size":
                    key = "size";
                    break;
                case this.id + "_year":
                    key = "year";
                    break;
                case this.id + "_audit":
                    key = "audit";
                    break;
                default:
                    if (key.indexOf("_") == -1 || key.substr(0, key.indexOf("_")) == this.id) {
                        throw { ID: 400, MESSAGE: "key not corresponding to valid field: " + key };
                    }
                    throw { ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where" };
            }
        }
        return key;
    };
    QueryController.prototype.baseObjectFilter = function (opCode, rest, objects) {
        if (Object.keys(rest).length != 1) {
            throw { ID: 400, MESSAGE: "Base opCode has many or zero initial keys" };
        }
        var key = Object.keys(rest)[0];
        key = this.convertFieldNames(key);
        var value = rest[Object.keys(rest)[0]];
        if (opCode == "IS" || opCode == "NIS") {
            if (typeof value != "string") {
                throw { ID: 400, MESSAGE: "Base opCode of IS or NIS does not contain string value" };
            }
        }
        else {
            try {
                value = Number(value);
            }
            catch (e) {
                throw { ID: 400, MESSAGE: "Base opCode of GT, LT, EQ or NEQ does not contain numeric value" };
            }
        }
        var operator;
        switch (opCode) {
            case "GT":
                operator = OperatorHelpers_1.default.GreaterThan;
                break;
            case "LT":
                operator = OperatorHelpers_1.default.LessThan;
                break;
            case "EQ":
                operator = OperatorHelpers_1.default.EqualTo;
                break;
            case "IS":
                operator = OperatorHelpers_1.default.StringIsEqualTo;
                break;
            case "NEQ":
                operator = OperatorHelpers_1.default.NotEqualTo;
                break;
            case "NIS":
                operator = OperatorHelpers_1.default.StringIsNotEqualTo;
                break;
            default:
                throw { ID: 400, MESSAGE: "Invalid base op code passed to baseObjectFilter: " + opCode };
        }
        var numObjects = objects.length;
        var filteredObjects = [];
        for (var i = 0; i < numObjects; i++) {
            var currObject = objects[i];
            if (operator(currObject, key, value)) {
                filteredObjects.push(currObject);
            }
        }
        return filteredObjects;
    };
    QueryController.joinFilters = function (opCode, object_arrays) {
        var filtered_objects = [];
        switch (opCode) {
            case "AND":
                object_arrays.sort(OperatorHelpers_1.default.compare_arrays);
                for (var i = 0; i < object_arrays[0].length; i++) {
                    var currKey = object_arrays[0][i].id_key;
                    var should_add = void 0;
                    for (var j = 1; j < object_arrays.length; j++) {
                        should_add = false;
                        for (var ii = 0; ii < object_arrays[j].length; ii++) {
                            if (object_arrays[j][ii].id_key == currKey) {
                                should_add = true;
                                break;
                            }
                        }
                        if (!should_add) {
                            break;
                        }
                    }
                    if (should_add) {
                        filtered_objects.push(object_arrays[0][i]);
                    }
                }
                break;
            case "OR":
                var filtered_object_keys = {};
                for (var i = 0; i < object_arrays.length; i++) {
                    for (var j = 0; j < object_arrays[i].length; j++) {
                        if (!(object_arrays[i][j].id_key in filtered_object_keys)) {
                            filtered_object_keys[object_arrays[i][j].id_key] = true;
                            filtered_objects.push(object_arrays[i][j]);
                        }
                    }
                }
                break;
            default:
                throw { ID: 400, MESSAGE: "Invalid logical operator given to join filter: " + opCode };
        }
        return filtered_objects;
    };
    QueryController.prototype.filterObjects = function (opCode, rest, objects, negated) {
        if (opCode == "GT" || opCode == "LT" || opCode == "EQ" || opCode == "IS") {
            if (!negated) {
                return this.baseObjectFilter(opCode, rest, objects);
            }
            else {
                switch (opCode) {
                    case "GT":
                        return this.baseObjectFilter("LT", rest, objects);
                    case "LT":
                        return this.baseObjectFilter("GT", rest, objects);
                    case "EQ":
                        return this.baseObjectFilter("NEQ", rest, objects);
                    case "IS":
                        return this.baseObjectFilter("NIS", rest, objects);
                    default:
                        throw { ID: 400, MESSAGE: "Invalid base opCode: " + opCode };
                }
            }
        }
        else if (opCode == "NOT") {
            if (Object.keys(rest).length != 1) {
                throw { ID: 400, MESSAGE: "0 or many keys passed to NOT" };
            }
            var nextOpCode = Object.keys(rest)[0];
            var nextRest = rest[Object.keys(rest)[0]];
            return this.filterObjects(nextOpCode, nextRest, objects, !negated);
        }
        else if (opCode == "OR" || opCode == "AND") {
            if (negated) {
                if (opCode == "OR") {
                    opCode = "AND";
                }
                else {
                    opCode = "OR";
                }
            }
            var numKeys = Object.keys(rest).length;
            var conditionArrays = [];
            for (var i = 0; i < numKeys; i++) {
                var conditionObject = rest[Object.keys(rest)[i]];
                if (Object.keys(conditionObject).length != 1) {
                    throw { ID: 400, MESSAGE: "condition object within AND or OR has 0 or 2+ keys" };
                }
                var nextOpCode = Object.keys(conditionObject)[0];
                var nextRest = conditionObject[nextOpCode];
                conditionArrays.push(this.filterObjects(nextOpCode, nextRest, objects, negated));
            }
            return QueryController.joinFilters(opCode, conditionArrays);
        }
        else {
            throw { ID: 400, MESSAGE: "Invalid opCode: " + opCode };
        }
    };
    QueryController.orderGroups = function (filteredGroups, instruction) {
        if (typeof (instruction) === "string") {
            return filteredGroups.sort(OperatorHelpers_1.default.dynamicSort([instruction], true));
        }
        else {
            var oInstruction = instruction;
            var ascending = (oInstruction.dir == "UP") ? true : false;
            return filteredGroups.sort(OperatorHelpers_1.default.dynamicSort(oInstruction.keys, ascending));
        }
    };
    QueryController.displayGroups = function (groupArray, columns, displayType) {
        var returnObjectArray = [];
        for (var g = 0; g < groupArray.length; g++) {
            var columnObject = {};
            for (var i = 0; i < columns.length; i++) {
                columnObject[columns[i]] = groupArray[g][columns[i]];
            }
            returnObjectArray.push(columnObject);
        }
        return { "render": displayType, "result": returnObjectArray };
    };
    return QueryController;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryController;
//# sourceMappingURL=QueryController.js.map