"use strict";
var chai_1 = require('chai');
var UIHelpers_1 = require("../src/rest/public/UIHelpers");
describe("UIHelpers", function () {
    it("Should be able to create a basic WHERE from a simple set of rules", function () {
        var data = {
            "condition": "AND",
            "rules": [
                {
                    "id": "courses_avg",
                    "field": "courses_avg",
                    "type": "double",
                    "input": "text",
                    "operator": "equal",
                    "value": "1"
                },
                {
                    "id": "courses_dept",
                    "field": "courses_dept",
                    "type": "string",
                    "input": "text",
                    "operator": "equal",
                    "value": "BEN"
                }
            ] };
        var testWHERE = UIHelpers_1.default.convertToWHERE(data);
        var compareWHERE = {
            "AND": [
                { "EQ": { "courses_avg": 1 } },
                { "IS": { "courses_dept": "BEN" } }
            ]
        };
        chai_1.expect(testWHERE.AND.length).to.equal(compareWHERE.AND.length);
        for (var i = 0; i < Object.keys(compareWHERE).length; i++) {
            chai_1.expect(Object.keys(testWHERE)[i]).to.equal(Object.keys(compareWHERE)[i]);
        }
    });
    it("Should be able to create a WHERE for nested AND's / OR's", function () {
        var data = {
            "condition": "OR",
            "rules": [
                {
                    "id": "courses_avg",
                    "field": "courses_avg",
                    "type": "double",
                    "input": "text",
                    "operator": "equal",
                    "value": "90"
                },
                {
                    "condition": "AND",
                    "rules": [
                        {
                            "id": "courses_avg",
                            "field": "courses_avg",
                            "type": "double",
                            "input": "text",
                            "operator": "equal",
                            "value": "70"
                        },
                        {
                            "id": "courses_dept",
                            "field": "courses_dept",
                            "type": "string",
                            "input": "text",
                            "operator": "equal",
                            "value": "adhe"
                        }
                    ]
                }
            ]
        };
        var compareWHERE = {
            "OR": [
                { "EQ": { "courses_avg": 90 } },
                { "AND": [
                        { "GT": { "courses_avg": 70 } },
                        { "IS": { "courses_dept": "adhe" } }
                    ] }
            ]
        };
        var testWHERE = UIHelpers_1.default.convertToWHERE(data);
        chai_1.expect(Object.keys(testWHERE).length).to.equal(Object.keys(compareWHERE).length);
        var testKeys = Object.keys(testWHERE);
        var compareKeys = Object.keys(compareWHERE);
        for (var i = 0; i < compareKeys.length; i++) {
            chai_1.expect(testKeys[i]).to.equal(compareKeys[i]);
        }
    });
    it("Should be able to apply NOT to an and/or group", function () {
        var data = {
            "condition": "AND",
            "rules": [
                {
                    "id": "courses_dept",
                    "field": "courses_dept",
                    "type": "string",
                    "input": "text",
                    "operator": "equal",
                    "value": "CPSC"
                },
                {
                    "id": "courses_avg",
                    "field": "courses_avg",
                    "type": "double",
                    "input": "text",
                    "operator": "equal",
                    "value": "10"
                }
            ],
            "not": true
        };
        var compareWHERE = {
            "NOT": { "AND": [
                    { "IS": { "courses_dept": "CPSC" } },
                    { "EQ": { "courses_avg": 10 } }
                ] }
        };
        var testWHERE = UIHelpers_1.default.convertToWHERE(data);
        chai_1.expect(testWHERE).to.equal(compareWHERE);
    });
});
//# sourceMappingURL=UIHelpersSpec.js.map