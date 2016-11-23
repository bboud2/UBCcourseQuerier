

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
        for(let i =0; i < Object.keys(compareWHERE).length; i++){
            expect(Object.keys(testWHERE)[i]).to.equal(Object.keys(compareWHERE)[i]);
        }
    });


    it("Should be able to create a WHERE for nested AND's / OR's", function(){
        let data:any = {
            "condition": "OR",
            "rules":[
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

        let compareWHERE: any = {
            "OR": [
                {"EQ": {"courses_avg": 90}},
                {"AND": [
                    {"GT": {"courses_avg": 70}},
                    {"IS": {"courses_dept": "adhe"}}
                ]}
            ]
        };
        let testWHERE: any = UIHelpers.convertToWHERE(data);
        expect(Object.keys(testWHERE).length).to.equal(Object.keys(compareWHERE).length);
        let testKeys:any = Object.keys(testWHERE);
        let compareKeys:any = Object.keys(compareWHERE);
        for(let i = 0; i < compareKeys.length; i++){
            expect(testKeys[i]).to.equal(compareKeys[i]);
        }
    });

    it("Should be able to apply NOT to an and/or group", function(){
        let data:any = {
            "condition": "AND",
            "rules":[
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

        let compareWHERE:any = {
            "NOT":
            {"AND":[
                {"IS": {"courses_dept": "CPSC"}},
                {"EQ": {"courses_avg": 10}}
            ]}
        };

        let testWHERE: any = UIHelpers.convertToWHERE(data);
        expect(testWHERE).to.equal(compareWHERE);
    })
});
