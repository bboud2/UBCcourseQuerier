/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets, Section, Course, Dataset} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";

import {expect} from 'chai';
describe("QueryController", function () {

    beforeEach(function () {
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
        let section1: Section = {id_key: "section1", audit: 1, avg: 75, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Kiczales", title: "computer programming"};
        let section2: Section = {id_key: "section2", audit: 1, avg: 55, course_num: "110", dept: "CPSC", fail: 5, pass: 100,
            professor: "Wolfman", title: "computer programming"};
        let section3: Section = {id_key: "section3", audit: 1, avg: 85, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Altshuler", title: "computer programming"};
        let section4: Section = {id_key: "section4", audit: 1, avg: 90, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Weir", title: "computer programming"};
        let section5: Section = {id_key: "section5", audit: 1, avg: 65, course_num: "200", dept: "BIOL", fail: 5, pass: 100,
            professor: "Couch", title: "computer programming"};
        let course1: Course = {id_key: "CPSC110", course_num: "110", dept: "CPSC", sections: [section1, section2]};
        let course2: Course = {id_key: "BIOL200", course_num: "200", dept: "BIOL", sections: [section3, section4, section5]};
        let dataset: Dataset = {id_key: "courses", courses:[course1, course2]};
        let datasets: Datasets = {sets: [dataset]};
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
        let controller = new QueryController(datasets);
        var x: any = controller.query(query, "courses");
        console.log(x);
    })
});
