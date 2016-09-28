/**
 * Created by Ben on 9/25/2016.
 */

import DatasetController from "../src/controller/DatasetController";
import JSONParser from "../src/controller/JSONParser";

import {expect} from 'chai';

describe("JSONParser", function () {

    beforeEach(function () {
    });

    afterEach(function (){
    });

    it("Should be able to return JSON OBJECT", function() {
        let testJSON = '{"result":[{"tier_eighty_five":13,"tier_ninety":30,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":10,"Other":7,"Low":12,"tier_sixty_four":6,"id":2982,"tier_sixty_eight":9,"tier_zero":0,"tier_seventy_six":16,"tier_thirty":2,"tier_fifty":1,"Professor":"mcgrenere, joanna","Audit":0,"tier_g_fifty":9,"tier_forty":4,"Withdrew":15,"Year":"2011","tier_twenty":0,"Stddev":16.1,"Enrolled":149,"tier_fifty_five":3,"tier_eighty":24,"tier_sixty":6,"tier_ten":3,"High":100,"Course":"110","Session":"w","Pass":118,"Fail":9,"Avg":76.94,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":13,"tier_ninety":19,"Title":"comptn, progrmng","Section":"102","Detail":"","tier_seventy_two":6,"Other":6,"Low":13,"tier_sixty_four":4,"id":2983,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":9,"tier_thirty":0,"tier_fifty":2,"Professor":"greif, chen","Audit":0,"tier_g_fifty":9,"tier_forty":6,"Withdrew":8,"Year":"2011","tier_twenty":1,"Stddev":17.87,"Enrolled":114,"tier_fifty_five":8,"tier_eighty":20,"tier_sixty":4,"tier_ten":2,"High":100,"Course":"110","Session":"w","Pass":91,"Fail":9,"Avg":74.95,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":41,"tier_ninety":47,"Title":"comptn, progrmng","Section":"103","Detail":"","tier_seventy_two":17,"Other":2,"Low":36,"tier_sixty_four":14,"id":2984,"tier_sixty_eight":13,"tier_zero":0,"tier_seventy_six":19,"tier_thirty":2,"tier_fifty":1,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":19,"tier_forty":17,"Withdrew":29,"Year":"2011","tier_twenty":0,"Stddev":14.83,"Enrolled":242,"tier_fifty_five":6,"tier_eighty":25,"tier_sixty":5,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":188,"Fail":19,"Avg":77.69,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":11,"tier_ninety":19,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":8,"Other":6,"Low":36,"tier_sixty_four":10,"id":2985,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":11,"tier_thirty":3,"tier_fifty":2,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":12,"tier_forty":9,"Withdrew":12,"Year":"2011","tier_twenty":0,"Stddev":16.13,"Enrolled":120,"tier_fifty_five":6,"tier_eighty":12,"tier_sixty":5,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":90,"Fail":12,"Avg":73.53,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":10,"tier_ninety":4,"Title":"comptn, progrmng","Section":"202","Detail":"","tier_seventy_two":11,"Other":2,"Low":25,"tier_sixty_four":9,"id":2986,"tier_sixty_eight":7,"tier_zero":0,"tier_seventy_six":8,"tier_thirty":3,"tier_fifty":4,"Professor":"little, james joseph","Audit":0,"tier_g_fifty":17,"tier_forty":12,"Withdrew":13,"Year":"2011","tier_twenty":2,"Stddev":15.74,"Enrolled":119,"tier_fifty_five":5,"tier_eighty":18,"tier_sixty":11,"tier_ten":0,"High":92,"Course":"110","Session":"w","Pass":87,"Fail":17,"Avg":67.82,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":4,"tier_ninety":12,"Title":"comptn, progrmng","Section":"bcs","Detail":"","tier_seventy_two":1,"Other":0,"Low":43,"tier_sixty_four":1,"id":2987,"tier_sixty_eight":0,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"greif, chen","Audit":0,"tier_g_fifty":1,"tier_forty":1,"Withdrew":0,"Year":"2011","tier_twenty":0,"Stddev":11.09,"Enrolled":28,"tier_fifty_five":0,"tier_eighty":8,"tier_sixty":0,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":27,"Fail":1,"Avg":85.46,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":92,"tier_ninety":131,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":53,"Other":23,"Low":12,"tier_sixty_four":44,"id":2988,"tier_sixty_eight":41,"tier_zero":0,"tier_seventy_six":64,"tier_thirty":10,"tier_fifty":10,"Professor":"","Audit":0,"tier_g_fifty":67,"tier_forty":49,"Withdrew":151,"Year":"2011","tier_twenty":3,"Stddev":16.21,"Enrolled":846,"tier_fifty_five":28,"tier_eighty":107,"tier_sixty":31,"tier_ten":5,"High":100,"Course":"110","Session":"w","Pass":601,"Fail":67,"Avg":75.29,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":19,"tier_ninety":41,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":20,"Other":7,"Low":14,"tier_sixty_four":17,"id":7882,"tier_sixty_eight":17,"tier_zero":0,"tier_seventy_six":27,"tier_thirty":7,"tier_fifty":3,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":38,"tier_forty":21,"Withdrew":19,"Year":"2014","tier_twenty":6,"Stddev":19.39,"Enrolled":245,"tier_fifty_five":5,"tier_eighty":21,"tier_sixty":10,"tier_ten":4,"High":100,"Course":"110","Session":"w","Pass":180,"Fail":38,"Avg":71.07,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":15,"tier_ninety":11,"Title":"comptn, progrmng","Section":"102","Detail":"","tier_seventy_two":7,"Other":3,"Low":20,"tier_sixty_four":6,"id":7883,"tier_sixty_eight":4,"tier_zero":0,"tier_seventy_six":8,"tier_thirty":1,"tier_fifty":1,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":11,"tier_forty":7,"Withdrew":10,"Year":"2014","tier_twenty":3,"Stddev":18.34,"Enrolled":95,"tier_fifty_five":3,"tier_eighty":11,"tier_sixty":5,"tier_ten":0,"High":99,"Course":"110","Session":"w","Pass":71,"Fail":11,"Avg":73.13,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":20,"tier_ninety":21,"Title":"comptn, progrmng","Section":"103","Detail":"","tier_seventy_two":25,"Other":9,"Low":23,"tier_sixty_four":9,"id":7884,"tier_sixty_eight":11,"tier_zero":0,"tier_seventy_six":20,"tier_thirty":2,"tier_fifty":3,"Professor":"allen, meghan","Audit":0,"tier_g_fifty":33,"tier_forty":29,"Withdrew":19,"Year":"2014","tier_twenty":2,"Stddev":16.64,"Enrolled":205,"tier_fifty_five":6,"tier_eighty":20,"tier_sixty":9,"tier_ten":0,"High":99,"Course":"110","Session":"w","Pass":144,"Fail":33,"Avg":70.83,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":22,"tier_ninety":20,"Title":"comptn, progrmng","Section":"104","Detail":"","tier_seventy_two":14,"Other":8,"Low":15,"tier_sixty_four":12,"id":7885,"tier_sixty_eight":8,"tier_zero":0,"tier_seventy_six":18,"tier_thirty":2,"tier_fifty":2,"Professor":"garcia, ronald","Audit":0,"tier_g_fifty":26,"tier_forty":18,"Withdrew":17,"Year":"2014","tier_twenty":5,"Stddev":18.33,"Enrolled":176,"tier_fifty_five":8,"tier_eighty":16,"tier_sixty":5,"tier_ten":1,"High":100,"Course":"110","Session":"w","Pass":125,"Fail":26,"Avg":71.09,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":11,"tier_ninety":16,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":12,"Other":8,"Low":21,"tier_sixty_four":12,"id":7886,"tier_sixty_eight":12,"tier_zero":0,"tier_seventy_six":6,"tier_thirty":3,"tier_fifty":6,"Professor":"aiello, william","Audit":0,"tier_g_fifty":15,"tier_forty":10,"Withdrew":21,"Year":"2014","tier_twenty":2,"Stddev":16.4,"Enrolled":153,"tier_fifty_five":9,"tier_eighty":21,"tier_sixty":4,"tier_ten":0,"High":95,"Course":"110","Session":"w","Pass":109,"Fail":15,"Avg":70.9,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":20,"tier_ninety":32,"Title":"comptn, progrmng","Section":"202","Detail":"","tier_seventy_two":18,"Other":7,"Low":29,"tier_sixty_four":10,"id":7887,"tier_sixty_eight":13,"tier_zero":0,"tier_seventy_six":11,"tier_thirty":3,"tier_fifty":5,"Professor":"carter, paul martin","Audit":0,"tier_g_fifty":20,"tier_forty":16,"Withdrew":18,"Year":"2014","tier_twenty":1,"Stddev":16.37,"Enrolled":195,"tier_fifty_five":8,"tier_eighty":23,"tier_sixty":10,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":150,"Fail":20,"Avg":73.56,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":12,"tier_ninety":24,"Title":"comptn, progrmng","Section":"bcs","Detail":"","tier_seventy_two":5,"Other":2,"Low":45,"tier_sixty_four":1,"id":7888,"tier_sixty_eight":1,"tier_zero":0,"tier_seventy_six":4,"tier_thirty":0,"tier_fifty":0,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":1,"tier_forty":1,"Withdrew":2,"Year":"2014","tier_twenty":0,"Stddev":10.67,"Enrolled":65,"tier_fifty_five":0,"tier_eighty":11,"tier_sixty":2,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":60,"Fail":1,"Avg":85.11,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":8,"tier_ninety":4,"Title":"comptn, progrmng","Section":"v01","Detail":"","tier_seventy_two":5,"Other":0,"Low":32,"tier_sixty_four":3,"id":7889,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":2,"tier_thirty":4,"tier_fifty":1,"Professor":"","Audit":0,"tier_g_fifty":13,"tier_forty":9,"Withdrew":4,"Year":"2014","tier_twenty":0,"Stddev":17.61,"Enrolled":64,"tier_fifty_five":3,"tier_eighty":12,"tier_sixty":3,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":47,"Fail":13,"Avg":68.9,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":127,"tier_ninety":169,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":106,"Other":51,"Low":14,"tier_sixty_four":70,"id":7890,"tier_sixty_eight":72,"tier_zero":0,"tier_seventy_six":96,"tier_thirty":22,"tier_fifty":21,"Professor":"","Audit":0,"tier_g_fifty":157,"tier_forty":111,"Withdrew":220,"Year":"2014","tier_twenty":19,"Stddev":17.63,"Enrolled":1315,"tier_fifty_five":42,"tier_eighty":135,"tier_sixty":48,"tier_ten":5,"High":100,"Course":"110","Session":"w","Pass":886,"Fail":157,"Avg":72.28,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":15,"tier_ninety":18,"Title":"comptn, progrmng","Section":"911","Detail":"","tier_seventy_two":7,"Other":4,"Low":29,"tier_sixty_four":7,"id":12781,"tier_sixty_eight":8,"tier_zero":0,"tier_seventy_six":4,"tier_thirty":1,"tier_fifty":2,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":4,"tier_forty":2,"Withdrew":3,"Year":"2011","tier_twenty":1,"Stddev":14.92,"Enrolled":90,"tier_fifty_five":3,"tier_eighty":9,"tier_sixty":5,"tier_ten":0,"High":100,"Course":"110","Session":"s","Pass":78,"Fail":4,"Avg":77.11,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":2,"tier_ninety":14,"Title":"comptn, progrmng","Section":"921","Detail":"","tier_seventy_two":2,"Other":0,"Low":60,"tier_sixty_four":3,"id":12782,"tier_sixty_eight":2,"tier_zero":0,"tier_seventy_six":5,"tier_thirty":0,"tier_fifty":0,"Professor":"eiselt, kurt","Audit":0,"tier_g_fifty":0,"tier_forty":0,"Withdrew":5,"Year":"2011","tier_twenty":0,"Stddev":11.12,"Enrolled":40,"tier_fifty_five":0,"tier_eighty":5,"tier_sixty":2,"tier_ten":0,"High":99,"Course":"110","Session":"s","Pass":35,"Fail":0,"Avg":82.43,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":17,"tier_ninety":32,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":9,"Other":4,"Low":29,"tier_sixty_four":10,"id":12783,"tier_sixty_eight":10,"tier_zero":0,"tier_seventy_six":9,"tier_thirty":1,"tier_fifty":2,"Professor":"","Audit":0,"tier_g_fifty":4,"tier_forty":2,"Withdrew":23,"Year":"2011","tier_twenty":1,"Stddev":14.06,"Enrolled":145,"tier_fifty_five":3,"tier_eighty":14,"tier_sixty":7,"tier_ten":0,"High":100,"Course":"110","Session":"s","Pass":113,"Fail":4,"Avg":78.7,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":10,"tier_ninety":13,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":9,"Other":7,"Low":13,"tier_sixty_four":7,"id":17864,"tier_sixty_eight":5,"tier_zero":0,"tier_seventy_six":11,"tier_thirty":3,"tier_fifty":1,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":25,"tier_forty":19,"Withdrew":11,"Year":"2010","tier_twenty":2,"Stddev":18.82,"Enrolled":128,"tier_fifty_five":0,"tier_eighty":25,"tier_sixty":3,"tier_ten":1,"High":99,"Course":"110","Session":"w","Pass":84,"Fail":25,"Avg":70.75,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":12,"tier_ninety":28,"Title":"comptn, progrmng","Section":"102","Detail":"","tier_seventy_two":8,"Other":2,"Low":34,"tier_sixty_four":6,"id":17865,"tier_sixty_eight":13,"tier_zero":0,"tier_seventy_six":11,"tier_thirty":1,"tier_fifty":0,"Professor":"eiselt, kurt","Audit":0,"tier_g_fifty":13,"tier_forty":12,"Withdrew":11,"Year":"2010","tier_twenty":0,"Stddev":15.55,"Enrolled":129,"tier_fifty_five":2,"tier_eighty":18,"tier_sixty":5,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":103,"Fail":13,"Avg":76.59,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":19,"tier_ninety":40,"Title":"comptn, progrmng","Section":"103","Detail":"","tier_seventy_two":12,"Other":1,"Low":31,"tier_sixty_four":2,"id":17866,"tier_sixty_eight":7,"tier_zero":0,"tier_seventy_six":9,"tier_thirty":2,"tier_fifty":1,"Professor":"carter, paul martin","Audit":0,"tier_g_fifty":11,"tier_forty":9,"Withdrew":8,"Year":"2010","tier_twenty":0,"Stddev":15.53,"Enrolled":136,"tier_fifty_five":4,"tier_eighty":16,"tier_sixty":6,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":116,"Fail":11,"Avg":78.85,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":10,"tier_ninety":11,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":5,"Other":3,"Low":42,"tier_sixty_four":5,"id":17867,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":5,"tier_thirty":0,"tier_fifty":1,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":2,"tier_forty":2,"Withdrew":6,"Year":"2010","tier_twenty":0,"Stddev":12.51,"Enrolled":74,"tier_fifty_five":3,"tier_eighty":13,"tier_sixty":4,"tier_ten":0,"High":97,"Course":"110","Session":"w","Pass":63,"Fail":2,"Avg":76.98,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":7,"tier_ninety":7,"Title":"comptn, progrmng","Section":"202","Detail":"","tier_seventy_two":7,"Other":1,"Low":16,"tier_sixty_four":5,"id":17868,"tier_sixty_eight":8,"tier_zero":0,"tier_seventy_six":9,"tier_thirty":1,"tier_fifty":3,"Professor":"eiselt, kurt","Audit":0,"tier_g_fifty":5,"tier_forty":2,"Withdrew":16,"Year":"2010","tier_twenty":1,"Stddev":16.05,"Enrolled":84,"tier_fifty_five":5,"tier_eighty":7,"tier_sixty":2,"tier_ten":1,"High":95,"Course":"110","Session":"w","Pass":60,"Fail":5,"Avg":71.6,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":1,"tier_ninety":4,"Title":"comptn, progrmng","Section":"bcs","Detail":"","tier_seventy_two":0,"Other":1,"Low":45,"tier_sixty_four":0,"id":17869,"tier_sixty_eight":0,"tier_zero":0,"tier_seventy_six":1,"tier_thirty":0,"tier_fifty":0,"Professor":"carter, paul martin","Audit":0,"tier_g_fifty":1,"tier_forty":1,"Withdrew":1,"Year":"2010","tier_twenty":0,"Stddev":18.23,"Enrolled":9,"tier_fifty_five":0,"tier_eighty":0,"tier_sixty":0,"tier_ten":0,"High":98,"Course":"110","Session":"w","Pass":6,"Fail":1,"Avg":83.43,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":59,"tier_ninety":103,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":41,"Other":15,"Low":13,"tier_sixty_four":25,"id":17870,"tier_sixty_eight":39,"tier_zero":0,"tier_seventy_six":46,"tier_thirty":7,"tier_fifty":6,"Professor":"","Audit":0,"tier_g_fifty":57,"tier_forty":45,"Withdrew":104,"Year":"2010","tier_twenty":3,"Stddev":16.35,"Enrolled":611,"tier_fifty_five":14,"tier_eighty":79,"tier_sixty":20,"tier_ten":2,"High":100,"Course":"110","Session":"w","Pass":432,"Fail":57,"Avg":75.36,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":3,"tier_ninety":9,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":4,"Other":0,"Low":0,"tier_sixty_four":3,"id":31109,"tier_sixty_eight":1,"tier_zero":1,"tier_seventy_six":5,"tier_thirty":1,"tier_fifty":2,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":6,"tier_forty":3,"Withdrew":8,"Year":"2009","tier_twenty":1,"Stddev":21.89,"Enrolled":50,"tier_fifty_five":2,"tier_eighty":6,"tier_sixty":1,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":36,"Fail":6,"Avg":71.4,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":3,"tier_ninety":11,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":0,"Other":0,"Low":0,"tier_sixty_four":4,"id":31110,"tier_sixty_eight":2,"tier_zero":1,"tier_seventy_six":3,"tier_thirty":1,"tier_fifty":3,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":3,"tier_forty":0,"Withdrew":5,"Year":"2009","tier_twenty":0,"Stddev":23.69,"Enrolled":38,"tier_fifty_five":2,"tier_eighty":1,"tier_sixty":1,"tier_ten":1,"High":100,"Course":"110","Session":"w","Pass":30,"Fail":3,"Avg":72.58,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":6,"tier_ninety":20,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":4,"Other":0,"Low":0,"tier_sixty_four":7,"id":31111,"tier_sixty_eight":3,"tier_zero":2,"tier_seventy_six":8,"tier_thirty":2,"tier_fifty":5,"Professor":"","Audit":0,"tier_g_fifty":9,"tier_forty":3,"Withdrew":26,"Year":"2009","tier_twenty":1,"Stddev":22.55,"Enrolled":101,"tier_fifty_five":4,"tier_eighty":7,"tier_sixty":2,"tier_ten":1,"High":100,"Course":"110","Session":"w","Pass":66,"Fail":9,"Avg":71.92,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":23,"tier_ninety":37,"Title":"comptn, progrmng","Section":"911","Detail":"","tier_seventy_two":13,"Other":2,"Low":12,"tier_sixty_four":6,"id":42199,"tier_sixty_eight":9,"tier_zero":0,"tier_seventy_six":18,"tier_thirty":4,"tier_fifty":3,"Professor":"allen, meghan","Audit":1,"tier_g_fifty":16,"tier_forty":10,"Withdrew":4,"Year":"2014","tier_twenty":1,"Stddev":16.83,"Enrolled":168,"tier_fifty_five":6,"tier_eighty":21,"tier_sixty":9,"tier_ten":1,"High":99,"Course":"110","Session":"s","Pass":145,"Fail":16,"Avg":75.81,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":23,"tier_ninety":37,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":13,"Other":2,"Low":12,"tier_sixty_four":6,"id":42200,"tier_sixty_eight":9,"tier_zero":0,"tier_seventy_six":18,"tier_thirty":4,"tier_fifty":3,"Professor":"","Audit":2,"tier_g_fifty":16,"tier_forty":10,"Withdrew":8,"Year":"2014","tier_twenty":1,"Stddev":16.83,"Enrolled":173,"tier_fifty_five":6,"tier_eighty":21,"tier_sixty":9,"tier_ten":1,"High":99,"Course":"110","Session":"s","Pass":145,"Fail":16,"Avg":75.81,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":45,"tier_ninety":51,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":43,"Other":0,"Low":2,"tier_sixty_four":29,"id":47423,"tier_sixty_eight":34,"tier_zero":2,"tier_seventy_six":34,"tier_thirty":15,"tier_fifty":13,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":59,"tier_forty":30,"Withdrew":36,"Year":"2013","tier_twenty":8,"Stddev":19.18,"Enrolled":404,"tier_fifty_five":16,"tier_eighty":29,"tier_sixty":14,"tier_ten":4,"High":100,"Course":"110","Session":"w","Pass":308,"Fail":59,"Avg":70.11,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":8,"tier_ninety":17,"Title":"comptn, progrmng","Section":"102","Detail":"","tier_seventy_two":4,"Other":4,"Low":9,"tier_sixty_four":6,"id":47424,"tier_sixty_eight":7,"tier_zero":1,"tier_seventy_six":9,"tier_thirty":1,"tier_fifty":1,"Professor":"garcia, ronald","Audit":0,"tier_g_fifty":17,"tier_forty":12,"Withdrew":11,"Year":"2013","tier_twenty":2,"Stddev":20.06,"Enrolled":106,"tier_fifty_five":4,"tier_eighty":11,"tier_sixty":7,"tier_ten":1,"High":100,"Course":"110","Session":"w","Pass":74,"Fail":17,"Avg":70.88,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":14,"tier_ninety":29,"Title":"comptn, progrmng","Section":"103","Detail":"","tier_seventy_two":18,"Other":5,"Low":11,"tier_sixty_four":14,"id":47425,"tier_sixty_eight":17,"tier_zero":0,"tier_seventy_six":16,"tier_thirty":3,"tier_fifty":3,"Professor":"allen, meghan","Audit":0,"tier_g_fifty":29,"tier_forty":16,"Withdrew":21,"Year":"2013","tier_twenty":8,"Stddev":19.25,"Enrolled":212,"tier_fifty_five":11,"tier_eighty":25,"tier_sixty":9,"tier_ten":2,"High":100,"Course":"110","Session":"w","Pass":156,"Fail":29,"Avg":70.59,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":16,"tier_ninety":28,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":5,"Other":11,"Low":4,"tier_sixty_four":6,"id":47426,"tier_sixty_eight":11,"tier_zero":1,"tier_seventy_six":7,"tier_thirty":5,"tier_fifty":5,"Professor":"little, james joseph","Audit":0,"tier_g_fifty":15,"tier_forty":5,"Withdrew":16,"Year":"2013","tier_twenty":3,"Stddev":20.93,"Enrolled":144,"tier_fifty_five":5,"tier_eighty":14,"tier_sixty":3,"tier_ten":1,"High":100,"Course":"110","Session":"w","Pass":100,"Fail":15,"Avg":73.83,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":12,"tier_ninety":32,"Title":"comptn, progrmng","Section":"202","Detail":"","tier_seventy_two":17,"Other":9,"Low":7,"tier_sixty_four":8,"id":47427,"tier_sixty_eight":15,"tier_zero":1,"tier_seventy_six":16,"tier_thirty":9,"tier_fifty":10,"Professor":"carter, paul martin","Audit":0,"tier_g_fifty":28,"tier_forty":9,"Withdrew":12,"Year":"2013","tier_twenty":6,"Stddev":21.13,"Enrolled":187,"tier_fifty_five":6,"tier_eighty":15,"tier_sixty":7,"tier_ten":3,"High":100,"Course":"110","Session":"w","Pass":138,"Fail":28,"Avg":69.7,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":10,"tier_ninety":16,"Title":"comptn, progrmng","Section":"bcs","Detail":"","tier_seventy_two":3,"Other":1,"Low":45,"tier_sixty_four":0,"id":47428,"tier_sixty_eight":2,"tier_zero":0,"tier_seventy_six":5,"tier_thirty":0,"tier_fifty":0,"Professor":"garcia, ronald","Audit":0,"tier_g_fifty":2,"tier_forty":2,"Withdrew":4,"Year":"2013","tier_twenty":0,"Stddev":14.11,"Enrolled":50,"tier_fifty_five":2,"tier_eighty":3,"tier_sixty":2,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":43,"Fail":2,"Avg":82.44,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":105,"tier_ninety":173,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":90,"Other":32,"Low":2,"tier_sixty_four":63,"id":47429,"tier_sixty_eight":86,"tier_zero":5,"tier_seventy_six":87,"tier_thirty":33,"tier_fifty":32,"Professor":"","Audit":0,"tier_g_fifty":150,"tier_forty":74,"Withdrew":199,"Year":"2013","tier_twenty":27,"Stddev":19.78,"Enrolled":1204,"tier_fifty_five":44,"tier_eighty":97,"tier_sixty":42,"tier_ten":11,"High":100,"Course":"110","Session":"w","Pass":819,"Fail":150,"Avg":71.22,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":22,"tier_ninety":26,"Title":"comptn, progrmng","Section":"911","Detail":"","tier_seventy_two":7,"Other":1,"Low":35,"tier_sixty_four":7,"id":55368,"tier_sixty_eight":10,"tier_zero":0,"tier_seventy_six":15,"tier_thirty":2,"tier_fifty":1,"Professor":"allen, meghan","Audit":0,"tier_g_fifty":13,"tier_forty":11,"Withdrew":17,"Year":"2013","tier_twenty":0,"Stddev":15.25,"Enrolled":149,"tier_fifty_five":9,"tier_eighty":18,"tier_sixty":2,"tier_ten":0,"High":100,"Course":"110","Session":"s","Pass":117,"Fail":13,"Avg":75.89,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":22,"tier_ninety":26,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":7,"Other":2,"Low":35,"tier_sixty_four":7,"id":55369,"tier_sixty_eight":10,"tier_zero":0,"tier_seventy_six":15,"tier_thirty":2,"tier_fifty":1,"Professor":"","Audit":0,"tier_g_fifty":13,"tier_forty":11,"Withdrew":43,"Year":"2013","tier_twenty":0,"Stddev":15.25,"Enrolled":176,"tier_fifty_five":9,"tier_eighty":18,"tier_sixty":2,"tier_ten":0,"High":100,"Course":"110","Session":"s","Pass":117,"Fail":13,"Avg":75.89,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":46,"tier_ninety":65,"Title":"comptn, progrmng","Section":"101","Detail":"","tier_seventy_two":33,"Other":15,"Low":14,"tier_sixty_four":19,"id":59597,"tier_sixty_eight":26,"tier_zero":0,"tier_seventy_six":27,"tier_thirty":8,"tier_fifty":5,"Professor":"kiczales, gregor","Audit":0,"tier_g_fifty":40,"tier_forty":27,"Withdrew":44,"Year":"2012","tier_twenty":3,"Stddev":17.27,"Enrolled":409,"tier_fifty_five":18,"tier_eighty":48,"tier_sixty":19,"tier_ten":2,"High":100,"Course":"110","Session":"w","Pass":306,"Fail":40,"Avg":74.24,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":12,"tier_ninety":12,"Title":"comptn, progrmng","Section":"102","Detail":"","tier_seventy_two":11,"Other":3,"Low":19,"tier_sixty_four":3,"id":59598,"tier_sixty_eight":10,"tier_zero":0,"tier_seventy_six":12,"tier_thirty":2,"tier_fifty":1,"Professor":"mcgrenere, joanna","Audit":0,"tier_g_fifty":17,"tier_forty":13,"Withdrew":12,"Year":"2012","tier_twenty":1,"Stddev":17.03,"Enrolled":118,"tier_fifty_five":5,"tier_eighty":13,"tier_sixty":6,"tier_ten":1,"High":98,"Course":"110","Session":"w","Pass":85,"Fail":17,"Avg":71.18,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":16,"tier_ninety":17,"Title":"comptn, progrmng","Section":"103","Detail":"","tier_seventy_two":11,"Other":5,"Low":21,"tier_sixty_four":4,"id":59599,"tier_sixty_eight":4,"tier_zero":0,"tier_seventy_six":12,"tier_thirty":4,"tier_fifty":3,"Professor":"garcia, ronald","Audit":0,"tier_g_fifty":21,"tier_forty":15,"Withdrew":12,"Year":"2012","tier_twenty":2,"Stddev":17.89,"Enrolled":139,"tier_fifty_five":3,"tier_eighty":27,"tier_sixty":4,"tier_ten":0,"High":100,"Course":"110","Session":"w","Pass":101,"Fail":21,"Avg":72.89,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":13,"tier_ninety":18,"Title":"comptn, progrmng","Section":"201","Detail":"","tier_seventy_two":16,"Other":4,"Low":0,"tier_sixty_four":11,"id":59600,"tier_sixty_eight":10,"tier_zero":1,"tier_seventy_six":18,"tier_thirty":4,"tier_fifty":1,"Professor":"carter, paul martin","Audit":1,"tier_g_fifty":18,"tier_forty":12,"Withdrew":12,"Year":"2012","tier_twenty":1,"Stddev":16.8,"Enrolled":150,"tier_fifty_five":3,"tier_eighty":14,"tier_sixty":11,"tier_ten":0,"High":97,"Course":"110","Session":"w","Pass":115,"Fail":18,"Avg":71.44,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":12,"tier_ninety":17,"Title":"comptn, progrmng","Section":"202","Detail":"","tier_seventy_two":9,"Other":10,"Low":14,"tier_sixty_four":8,"id":59601,"tier_sixty_eight":12,"tier_zero":0,"tier_seventy_six":6,"tier_thirty":9,"tier_fifty":9,"Professor":"little, james joseph","Audit":0,"tier_g_fifty":21,"tier_forty":10,"Withdrew":17,"Year":"2012","tier_twenty":1,"Stddev":18.56,"Enrolled":147,"tier_fifty_five":3,"tier_eighty":11,"tier_sixty":12,"tier_ten":1,"High":99,"Course":"110","Session":"w","Pass":99,"Fail":21,"Avg":67.79,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":7,"tier_ninety":10,"Title":"comptn, progrmng","Section":"bcs","Detail":"","tier_seventy_two":2,"Other":0,"Low":37,"tier_sixty_four":0,"id":59602,"tier_sixty_eight":1,"tier_zero":0,"tier_seventy_six":3,"tier_thirty":1,"tier_fifty":2,"Professor":"mcgrenere, joanna","Audit":0,"tier_g_fifty":1,"tier_forty":0,"Withdrew":2,"Year":"2012","tier_twenty":0,"Stddev":13.82,"Enrolled":33,"tier_fifty_five":0,"tier_eighty":5,"tier_sixty":0,"tier_ten":0,"High":98,"Course":"110","Session":"w","Pass":30,"Fail":1,"Avg":82.32,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":106,"tier_ninety":139,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":82,"Other":39,"Low":0,"tier_sixty_four":45,"id":59603,"tier_sixty_eight":63,"tier_zero":1,"tier_seventy_six":78,"tier_thirty":28,"tier_fifty":21,"Professor":"","Audit":3,"tier_g_fifty":118,"tier_forty":77,"Withdrew":197,"Year":"2012","tier_twenty":8,"Stddev":17.52,"Enrolled":1098,"tier_fifty_five":32,"tier_eighty":118,"tier_sixty":52,"tier_ten":4,"High":100,"Course":"110","Session":"w","Pass":736,"Fail":118,"Avg":72.63,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":19,"tier_ninety":16,"Title":"comptn, progrmng","Section":"911","Detail":"","tier_seventy_two":10,"Other":2,"Low":36,"tier_sixty_four":7,"id":66968,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":10,"tier_thirty":1,"tier_fifty":0,"Professor":"kiczales, gregor","Audit":2,"tier_g_fifty":7,"tier_forty":6,"Withdrew":12,"Year":"2012","tier_twenty":0,"Stddev":13.34,"Enrolled":118,"tier_fifty_five":3,"tier_eighty":20,"tier_sixty":4,"tier_ten":0,"High":98,"Course":"110","Session":"s","Pass":95,"Fail":7,"Avg":77.43,"Campus":"ubc","Subject":"cpsc"},{"tier_eighty_five":19,"tier_ninety":16,"Title":"comptn, progrmng","Section":"overall","Detail":"","tier_seventy_two":10,"Other":2,"Low":36,"tier_sixty_four":7,"id":66969,"tier_sixty_eight":6,"tier_zero":0,"tier_seventy_six":10,"tier_thirty":1,"tier_fifty":0,"Professor":"","Audit":5,"tier_g_fifty":7,"tier_forty":6,"Withdrew":24,"Year":"2012","tier_twenty":0,"Stddev":13.34,"Enrolled":133,"tier_fifty_five":3,"tier_eighty":20,"tier_sixty":4,"tier_ten":0,"High":98,"Course":"110","Session":"s","Pass":95,"Fail":7,"Avg":77.43,"Campus":"ubc","Subject":"cpsc"}],"rank":1093}';


        let result = JSONParser.parseCourse("CPSC", "110", testJSON);
    })
});