import InsightFacade from "../src/controller/InsightFacade";
import {QueryRequest} from "../src/controller/QueryController";
import {expect} from 'chai';
import JSZip = require('jszip');
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
    });

    it("Should be able to put a dataset", function(){

        var zip = new JSZip();
        zip.file("1234");
        zip.folder("1234").file("ADHE327.json", '{"result":[{"tier_eighty_five":9,"tier_ninety":8,"Title":"teach adult","Section":"63a","Detail":"","tier_seventy_two":0,"Other":0,"Low":58,"tier_sixty_four":0,"id":234,"tier_sixty_eight":0,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"smulders, dave","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2011","tier_twenty":0,"Stddev":7.42,"Enrolled":24,"tier_fifty_five":1,"tier_eighty":4,"tier_sixty":0,"tier_ten":0,"High":95,"Course":"327","Session":"w","Pass":23,"Fail":0,"Avg":86.17,"Campus":"ubc","Subject":"adhe"}],"rank":152})');

       // return zip.generateAsync({type:"base64"}).then(function(result){
       //     expect(result).to.equal(false);
       // }).catch(function(error){
       //     expect(error).to.be("abc");
       // });


        return zip.generateAsync({type:"base64"}).then(function (content){
            facade.addDataset("1234", content).then(function (result){
                expect(result.code).to.equal(200);
            }).catch(function(error){
                expect(error).to.equal(false);
            })
        });

    });

    it("Should be able to delete a dataset", function(){
        var zip = new JSZip();
        zip.file("1234");
        zip.folder("1234").file("ADHE327.json", '{"result":[{"tier_eighty_five":9,"tier_ninety":8,"Title":"teach adult","Section":"63a","Detail":"","tier_seventy_two":0,"Other":0,"Low":58,"tier_sixty_four":0,"id":234,"tier_sixty_eight":0,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"smulders, dave","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":1,"Year":"2011","tier_twenty":0,"Stddev":7.42,"Enrolled":24,"tier_fifty_five":1,"tier_eighty":4,"tier_sixty":0,"tier_ten":0,"High":95,"Course":"327","Session":"w","Pass":23,"Fail":0,"Avg":86.17,"Campus":"ubc","Subject":"adhe"}],"rank":152})');

        return zip.generateAsync({type:"base64"}).then(function (content){
            facade.addDataset("1234", content).then(function (result){
                facade.removeDataset("1234").catch(function(error){
                    expect(error).to.equal(false);
                })
            }).catch(function(error){
                expect.fail("error in adding dataset");
            })
        }).catch(function(error){
            expect.fail("error in generating zip");
        })

    })

});
