"use strict";
var QueryController_1 = require("../src/controller/QueryController");
var chai_1 = require('chai');
describe("QueryController", function () {
    var section1;
    var section2;
    var section3;
    var section4;
    var section5;
    var dataset;
    var datasets;
    var controller;
    beforeEach(function () {
        section1 = { id_key: "section1", audit: 1, avg: 75, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Kiczales", title: "computer programming" };
        section2 = { id_key: "section2", audit: 1, avg: 55, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Wolfman", title: "computer programming" };
        section3 = { id_key: "section3", audit: 1, avg: 85, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Altshuler", title: "computer programming" };
        section4 = { id_key: "section4", audit: 1, avg: 90, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Weir", title: "computer programming" };
        section5 = { id_key: "section5", audit: 1, avg: 65, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Couch", title: "computer programming" };
        dataset = { id_key: "courses", sections: [section1, section2, section3, section4] };
        datasets = { sets: [dataset] };
        controller = new QueryController_1.default(datasets);
    });
    afterEach(function () {
    });
    it("Should be able to validate a valid query", function () {
        var query = { GET: 'food_food', WHERE: { IS: 'apple' }, ORDER: 'food', AS: 'table' };
        var dataset = { sets: [] };
        var controller = new QueryController_1.default(dataset);
        var isValid = QueryController_1.default.isValid(query);
        chai_1.expect(isValid).to.equal(true);
    });
    it("Should be able to invalidate an invalid query", function () {
        var query = null;
        var datasets = { sets: [] };
        var controller = new QueryController_1.default(datasets);
        chai_1.expect(QueryController_1.default.isValid.bind(controller, query)).to.throw();
    });
    it("Should get an error when we try out an invalid query", function () {
        var query = { GET: 'food', WHERE: { IS: 'apple' }, ORDER: 'food', AS: 'table' };
        var datasets = { sets: [] };
        var controller = new QueryController_1.default(datasets);
        chai_1.expect(controller.query.bind(controller, query)).to.throw();
    });
    it("Should successfully query given a valid query", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    { "AND": [
                            { "GT": { "courses_avg": 70 } },
                            { "IS": { "courses_dept": "cp*" } },
                            { "NOT": { "IS": { "courses_instructor": "murphy, gail" } } }
                        ] },
                    { "IS": { "courses_instructor": "*gregor*" } }
                ]
            },
            "AS": "TABLE"
        };
        var x = controller.query(query);
        console.log(x);
    });
    it("Should fail on a non-valid string within IS", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    { "AND": [
                            { "GT": { "courses_avg": 70 } },
                            { "NOT": { "IS": { "courses_dept": 234 } } }
                        ] },
                    { "EQ": { "courses_avg": 90 } }
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "Base opCode of IS or NIS does not contain string value" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to invalidate a QueryRequest with an empty GET", function () {
        var query = {
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "-1 additional key(s) in query (negative number means keys are missing)" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to handle a QueryRequest with an empty WHERE", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "-1 additional key(s) in query (negative number means keys are missing)" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to invalidate a QueryRequest with an empty AS", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": ""
        };
        var expected_err = { ID: 400, MESSAGE: "Invalid type given for AS" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a QueryRequest where we're trying to order by something not in GET", function () {
        var query = {
            "GET": ["courses_dept"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "Key for ORDER not present in keys for GET" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should reject a query with a non-number in in the MCOMPARATOR", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": "b"
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "Base opCode of GT, LT, EQ or NEQ does not contain numeric value" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a query with a number value in IS", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "IS": {
                    "courses_avg": 10
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "Base opCode of IS or NIS does not contain string value" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a query with an invalid base key", function () {
        var query = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "IS": {
                    "courses_avg": 10
                }
            },
            "PUMPKIN": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 400, MESSAGE: "1 additional key(s) in query (negative number means keys are missing)" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a query with a key that doesn't correspond to a dataset in memory", function () {
        var query = {
            "GET": ["wrong_dept", "wrong_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 10
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var expected_err = { ID: 424, MESSAGE: "dataset not found" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a query with a deep where not corresponding to a dataset in memory", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    { "AND": [
                            { "GT": { "courses_avg": 70 } },
                            { "IS": { "courses_dept": "cp*" } },
                            { "NOT": { "IS": { "wrong_instructor": "murphy, gail" } } }
                        ] },
                    { "IS": { "courses_instructor": "*gregor*" } }
                ]
            },
            "AS": "TABLE"
        };
        var expected_err = { ID: 424, MESSAGE: "Attempting to use invalid dataset in deep where" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
});
var error_comparison = (function () {
    function error_comparison() {
    }
    error_comparison.checkErrors = function (e1, e2) {
        return (e1.ID === e2.ID && e1.MESSAGE === e2.MESSAGE);
    };
    return error_comparison;
}());
//# sourceMappingURL=QueryControllerSpec.js.map