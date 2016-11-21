

import {expect} from 'chai';
import UIHelpers from "../src/rest/public/UIHelpers";
describe("UIHelpers", function () {

    it("Should be able to create a basic WHERE from a simple set of rules", function(){
        let data:any = {
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
        ]};
        let testWHERE:any = UIHelpers.convertToWHERE(data);

        let compareWHERE = {
            "AND": [
                {"EQ": {"courses_avg": 1}},
                {"IS": {"courses_dept": "BEN"}}
            ]
        };

        expect(testWHERE.AND.length).to.equal(compareWHERE.AND.length);


    });
});
