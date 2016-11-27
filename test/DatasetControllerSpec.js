"use strict";
var DatasetController_1 = require("../src/controller/DatasetController");
var Util_1 = require("../src/Util");
var fs = require('fs');
var JSZip = require('jszip');
var chai_1 = require('chai');
var assert_1 = require("assert");
describe("DatasetController", function () {
    var controller;
    beforeEach(function () {
        controller = new DatasetController_1.default();
    });
    it("Should fail if I don't pass a zip", function (done) {
        var x = { hi: "this is not a zip" };
        var result = controller.process("bad", x).then(function () {
            assert_1.fail();
            done();
        }).catch(function () {
            done();
        });
    });
    it("Should be able to receive a Dataset", function () {
        Util_1.default.test('Creating dataset');
        var content = { "result": [], "rank": 0 };
        var zip = new JSZip();
        zip.file('setA/content.json', JSON.stringify(content));
        var opts = {
            compression: 'deflate', compressionOptions: { level: 2 }, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Util_1.default.test('Dataset created');
            return controller.process('setA', data);
        }).then(function (result) {
            Util_1.default.test('Dataset processed; result: ' + result);
            chai_1.expect(result).to.equal(true);
        });
    });
    it("Should return null if we try to get dataset not in disk or memory", function () {
        var result = controller.getDataset("This ID does not exist in memory or disk");
        chai_1.expect(result).to.equal(null);
    });
    it("Should return the correct dataset if the object is present on disk but not in memory", function () {
        var fake_section = { id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5 };
        var fake_dataset = { id_key: "fake", sections: [fake_section] };
        controller.save("fake", fake_dataset);
        var result = controller.getDataset("fake");
        chai_1.expect(result).to.equal(fake_dataset);
    });
    it("Should return the correct dataset if the object is present in memory", function () {
        var fake_section = { id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5 };
        var fake_dataset = { id_key: "fake2", sections: [fake_section] };
        controller.datasets.sets.push(fake_dataset);
        var result = controller.getDataset("fake2");
        chai_1.expect(result).to.equal(fake_dataset);
    });
    it("Should be able to remove a dataset from disk", function () {
        var fake_section = { id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5 };
        var fake_dataset = { id_key: "fake", sections: [fake_section] };
        controller.save("fake", fake_dataset);
        controller.remove("fake");
        chai_1.expect(function () {
            fs.statSync("./data/fake.json");
        }).to.throw(Error);
    });
    it("Should be able to remove a dataset from memory", function () {
        var fake_section = { id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5 };
        var fake_dataset = { id_key: "fake", sections: [fake_section] };
        var fake_dataset2 = { id_key: "fake2", sections: [fake_section, fake_section] };
        controller.save("fake", fake_dataset);
        controller.save("fake2", fake_dataset2);
        controller.remove("fake");
        chai_1.expect(controller.datasets.sets.length).to.equal(1);
    });
});
//# sourceMappingURL=DatasetControllerSpec.js.map