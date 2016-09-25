/**
 * Created by Ben on 9/25/2016.
 */

import JSONParser from "../src/controller/JSONParser"

import DatasetController from "../src/controller/DatasetController";
import JSONParser from "../src/controller/JSONParser";

import {expect} from 'chai';

describe("JSONParser", function () {

    beforeEach(function () {
    });

    afterEach(function (){
    });

    it("Should be able to return JSON OBJECT", function() {
        let testJSON = JSON.parse('{"tier_eighty_five":13,"tier_ninety":30,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":10,"Other":7,"Low":12,"tier_sixty_four":6,"id":2982,"tier_sixty_eight":9,"tier_zero":0,"tier_seventy_six":16,"tier_thirty":2,"tier_fifty":1,"Professor":"mcgrenere, joanna","Audit":0,"tier_g_fifty":9,"tier_forty":4,"Withdrew":15,"Year":"2011","tier_twenty":0,"Stddev":16.1,"Enrolled":149,"tier_fifty_five":3,"tier_eighty":24,"tier_sixty":6,"tier_ten":3,"High":100,"Course":"110","Session":"w","Pass":118,"Fail":9,"Avg":76.94,"Campus":"ubc","Subject":"cpsc"}');


        let result = JSONParser.parseCourse(testJSON)
        expect(result).to.equal(testJSON);
    })
}