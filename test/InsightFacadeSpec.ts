import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/QueryController";
import {expect} from 'chai';
/**
 * Created by Ben on 10/15/2016.
 */

describe("InsightFacade", function(){

    var facade: InsightFacade;
    beforeEach(function() {
        facade = new InsightFacade();

    });

    afterEach (function(){

    });



    it("Should be able to return a 200 for a basic valid query", function(){

        let query: QueryRequest =
        {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {
                "GT": {
                    "courses_avg": 90
                }
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };

        facade.performQuery(query).then(function (result){
            expect(result.code).to.equal(200);
        }).catch(function(error){
            expect(error).to.equal(false);
            }
        )
    })

});
