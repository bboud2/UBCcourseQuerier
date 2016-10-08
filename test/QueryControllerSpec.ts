/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, Section, Dataset} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect, assert} from 'chai';
import {error} from "util";
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
        let query: QueryRequest = {GET: 'food', WHERE: {IS: 'apple'}, ORDER: 'food', AS: 'table'};
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
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "CPSC"}}
                    ]},
                    {"EQ": {"courses_avg": 90}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        var x: any = controller.query(query, "courses");
        console.log(x);
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

        assert.throws(function(){
            controller.query(query, "courses")
        }, "Query is undefined");


    });

    it("Should be able to handle a QueryRequest with an empty WHERE", function(){
        let query: any =
        {
            "GET": ["courses_dept", "courses_avg"],

            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        
        assert.throws(function(){
            controller.query(query,"courses")}, "Missing Where");
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

        assert.throws(function(){
            controller.query(query,"courses")}, "Invalid as type");

    });


    it("Should be able to reject a QueryRequest with an empty GET", function(){
        //turns out this test is handled by only ordering things that are caught
        let query: QueryRequest =
        {
            "GET": [],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        assert.throws(function(){
            controller.query(query,"courses")}, "Can't order by a non-displayed index");
    });




});
