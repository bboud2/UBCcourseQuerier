/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, Section, Dataset} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import {expect} from 'chai';


describe("QueryController", function () {
    var section1: Section;
    var section2: Section;
    var section3: Section;
    var section4: Section;
    var section5: Section;
    var dataset: Dataset;
    var datasets: Datasets;

    var controller: QueryController;

    beforeEach(function () {

         section1 = {id_key: "section1", audit: 1, avg: 75, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Kiczales", title: "computer programming"};
         section2= {id_key: "section2", audit: 1, avg: 55, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Wolfman", title: "computer programming"};
         section3= {id_key: "section3", audit: 1, avg: 85, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Altshuler", title: "computer programming"};
        section4= {id_key: "section4", audit: 1, avg: 90, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Weir", title: "computer programming"};
         section5 = {id_key: "section5", audit: 1, avg: 65, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Couch", title: "computer programming"};
         dataset = {id_key: "courses", sections:[section1,section2,section3,section4]};
         datasets = {sets: [dataset]};
        controller = new QueryController(datasets);
    });

    afterEach(function () {
    });

    it("Should be able to validate a valid query", function () {
        // NOTE: this is not actually a valid query for D1
        let query: QueryRequest = {GET: 'food_food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let dataset: Datasets = {sets: []};
        let controller = new QueryController(dataset);
        let isValid = QueryController.isValid(query);

        expect(isValid).to.equal(true);
    });

    it("Should be able to invalidate an invalid query", function () {
        let query: any = null;
        let datasets: Datasets = {sets: []};
        let controller = new QueryController(datasets);
        expect(QueryController.isValid.bind(controller, query)).to.throw();
    });

    it("Should get an error when we try out an invalid query", function () {
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
        let datasets: Datasets = {sets: []};
        let controller = new QueryController(datasets);
        expect(controller.query.bind(controller, query)).to.throw();
    });

    it("Should successfully query given a valid query", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        var x: any = controller.query(query);
        console.log(x);
    });

    it("Should fail on a non-valid string within IS", function () {

        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"NOT": {"IS": {"courses_dept": 234}}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let expected_err: any = {ID: 400, MESSAGE: "number passed as string: " + 234};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");
    });

    it("Should be able to invalidate a QueryRequest with an empty GET", function(){
        let query: any =
        {
            "WHERE": {
            "GT": {
                "courses_avg": 90
            }
        },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let expected_err: any = {ID: 400, MESSAGE: "Query is invalid"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");

    });

    it("Should be able to handle a QueryRequest with an empty WHERE", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_avg"],
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let expected_err: any = {ID: 400, MESSAGE: "Query is invalid"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");
        });




    it("Should be able to invalidate a QueryRequest with an empty AS",function() {
        let query: QueryRequest =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
            "GT": {
                "courses_avg": 90
            }
        },
            "ORDER": "courses_avg",
            "AS": ""
        };

        let expected_err: any = {ID: 400, MESSAGE: "Invalid type given for AS"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");

    });


    it("Should be able to reject a QueryRequest where we're trying to order by something not in GET", function(){
        let query: QueryRequest =
        {
            "GET": ["courses_dept"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let expected_err: any = {ID: 400, MESSAGE: "Key for ORDER not present in keys for GET"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");
    });

    it("Should reject a query with a non-number in in the MCOMPARATOR", function(){

        let query: QueryRequest =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": "b"
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let expected_err: any = {ID: 400, MESSAGE: "string passed as number: " + "b"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");

    });

    it("Should be able to reject a query with a number value in IS", function() {


        let query: QueryRequest =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "IS": {
                    "courses_avg": 10
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        let expected_err: any = {ID: 400, MESSAGE: "number passed as string: " + 10};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");

    });

    it("Should be able to reject a query with an invalid base key", function() {


        let query: any =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "IS": {
                    "courses_avg": 10
                }
            },
            "PUMPKIN": "courses_avg",
            "AS": "TABLE"
        };

        let expected_err: any = {ID: 400, MESSAGE: "at least one invalid key present in query base"};
        try {
            controller.query(query);
        } catch (actual_err) {
            expect(error_comparison.checkErrors(expected_err, actual_err)).to.equal(true);
            return;
        }
        expect(", but it didn't").to.equal("controller.query should have failed");
    });

});

class error_comparison {
    public static checkErrors(e1: any, e2: any) {
        return (e1.ID === e2.ID && e1.MESSAGE === e2.MESSAGE);
    }
}