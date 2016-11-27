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
        section1 = {
            id_key: "section1", audit: 1, avg: 75, course_num: "110", dept: "CPSC", fail: 8, pass: 100,
            professor: "Kiczales", title: "computer programming", section_id: "1"
        };
        section2 = {
            id_key: "section2", audit: 1, avg: 55, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Wolfman", title: "computer programming", section_id: "2"
        };
        section3 = {
            id_key: "section3", audit: 1, avg: 85, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Altshuler", title: "computer programming", section_id: "3"
        };
        section4 = {
            id_key: "section4", audit: 1, avg: 90, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Weir", title: "computer programming", section_id: "4"
        };
        section5 = {
            id_key: "section5", audit: 1, avg: 65, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Couch", title: "computer programming", section_id: "5"
        };
        dataset = { id_key: "courses", sections: [section1, section2, section3, section4] };
        datasets = { sets: [dataset] };
        controller = new QueryController_1.default(datasets);
    });
    afterEach(function () {
    });
    it("Should be able to query a valid query with D2 specification #1", function () {
        var query = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": { "IS": { "courses_dept": "CPSC" } },
            "GROUP": ["courses_id"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"] },
            "AS": "TABLE"
        };
        var x = controller.query(query);
        chai_1.expect(x.result[0].courses_id).to.equal('110');
        chai_1.expect(x.result[0].courseAverage).to.equal((55 + 75) / 2);
    });
    it("Should be able to query a valid querty with D2 specification #2", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "courseAverage": { "AVG": "courses_avg" } }, { "maxFail": { "MAX": "courses_fail" } }],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        var x = controller.query(query);
        chai_1.expect(x.result[0].courses_id).to.equal('110');
    });
    it("Should be able ot query a valid query with D2 specification #3", function () {
        section5.course_num = '201';
        var query = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "numSections": { "COUNT": "courses_uuid" } }],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        var x = controller.query(query);
        chai_1.expect(x.result[0].courses_id).to.equal('200');
    });
    it("Should be able to reject a query with a field without an _ in GROUP", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "numSections", "courseAverage"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id", "courseAverage"],
            "APPLY": [{ "numSections": { "COUNT": "courses_uuid" } }],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        var expected_error = { ID: 400, MESSAGE: "key: courseAverage was not found in APPLY" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_error, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to reject a query with an extra key in GROUP not found in GET", function () {
        var query = {
            "GET": ["courses_dept", "courses_id", "numSections", "courseAverage"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id", "courses_id"],
            "APPLY": [{ "numSections": { "COUNT": "courses_uuid" } }],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        var expected_error = { ID: 400, MESSAGE: "key: courseAverage was not found in APPLY" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_error, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to invalidate a query with no _ fields in GET", function () {
        var query = {
            "GET": ["numSections"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id", "courses_id"],
            "APPLY": [{ "numSections": { "COUNT": "courses_uuid" } }],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"] },
            "AS": "TABLE"
        };
        var expected_error = { ID: 400, MESSAGE: "No keys with an underscore so no dataset ID to look for" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_error, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    it("Should be able to invalidate a query with same keys in group and apply", function () {
        var query = {
            "GET": ["numSections", "courses_dept"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{ "numSections": { "COUNT": "courses_id" } }],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept"] },
            "AS": "TABLE"
        };
        var expected_error = { ID: 400, MESSAGE: "The following key was found in both apply and group: courses_id" };
        try {
            controller.query(query);
        }
        catch (actual_err) {
            chai_1.expect(error_comparison.checkErrors(expected_error, actual_err)).to.equal(true);
            return;
        }
        chai_1.expect(", but it didn't").to.equal("controller.query should have failed");
    });
    var error_comparison = (function () {
        function error_comparison() {
        }
        error_comparison.checkErrors = function (e1, e2) {
            return (e1.ID === e2.ID && e1.MESSAGE === e2.MESSAGE);
        };
        return error_comparison;
    }());
});
//# sourceMappingURL=QueryControllerD2Spec.js.map