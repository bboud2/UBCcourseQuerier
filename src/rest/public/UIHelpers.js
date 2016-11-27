"use strict";
var UIHelpers = (function () {
    function UIHelpers() {
    }
    UIHelpers.convertToWHERE = function (data) {
        var returnWHEREObject = {};
        if (data.condition == "AND" && data.rules.length == 1) {
        }
        var logicComparator = data.condition;
        var operatorArray = [];
        for (var i = 0; i < data.rules.length; i++) {
            operatorArray.push(UIHelpers.generateSubWHEREObject(data.rules[i]));
        }
        if (data.rules.length == 1) {
            operatorArray.push(UIHelpers.generateSubWHEREObject(data.rules[0]));
        }
        returnWHEREObject[logicComparator] = operatorArray;
        if (data.not == true) {
            var returnNOTWHEREObject = {};
            returnNOTWHEREObject.NOT = returnWHEREObject;
            return returnNOTWHEREObject;
        }
        else {
            return returnWHEREObject;
        }
    };
    UIHelpers.generateSubWHEREObject = function (object) {
        if (object.hasOwnProperty("condition")) {
            return UIHelpers.convertToWHERE(object);
        }
        var operatorTitle = UIHelpers.convertOperator(object);
        var newObject = {};
        var newSubObject = {};
        var subObjectValue = null;
        switch (object.type) {
            case "double":
                subObjectValue = parseFloat(object.value);
                break;
            case "integer":
                subObjectValue = parseInt(object.value);
                break;
            case "string":
                subObjectValue = object.value;
        }
        newSubObject[object.id] = object.value;
        newObject[operatorTitle] = newSubObject;
        return newObject;
    };
    UIHelpers.convertOperator = function (object) {
        if (object.type == "string") {
            if (object.operator == "equal") {
                return "IS";
            }
            else {
            }
        }
        else {
            switch (object.operator) {
                case "equal":
                    return "EQ";
                case "not_equal":
                    return "";
                case "less":
                    return "LT";
                case "greater":
                    return "GT";
            }
        }
    };
    return UIHelpers;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UIHelpers;
//# sourceMappingURL=UIHelpers.js.map