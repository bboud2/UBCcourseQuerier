/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";
import fs = require('fs');

import JSZip = require('jszip');
import {expect} from 'chai';
import {Dataset, Section, Datasets} from "../src/controller/DatasetController";
import {fail} from "assert";

describe("DatasetController", function () {

    var controller: DatasetController;

    beforeEach(function () {
        controller = new DatasetController();
    });

    it("Should fail if I don't pass a zip", function (done) {
        let x: any = {hi:"this is not a zip"};
        let result: any = controller.process("bad", x).then(function () {
            fail();
            done();
        }).catch(function() {
            done();
        });
    });

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content: any = {"result":[],"rank":0};
        let zip = new JSZip();
        zip.file('setA/content.json', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };
        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            return controller.process('setA', data);
        }).then(function (result) {
            Log.test('Dataset processed; result: ' + result);
            expect(result).to.equal(true);
        });

    });

    it("Should return null if we try to get dataset not in disk or memory", function() {
        let result = controller.getDataset("This ID does not exist in memory or disk");
        expect(result).to.equal(null);
    });

    it("Should return the correct dataset if the object is present on disk but not in memory", function() {
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_dataset: Dataset = {id_key: "fake", sections: [fake_section]};
        controller.save("fake", fake_dataset);
        let result = controller.getDataset("fake");
        expect(result).to.equal(fake_dataset);
    });

    it("Should return the correct dataset if the object is present in memory", function() {
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_dataset: Dataset = {id_key: "fake2", sections: [fake_section]}
        controller.datasets.sets.push(fake_dataset);
        let result = controller.getDataset("fake2");
        expect(result).to.equal(fake_dataset);
    });


    it("Should be able to remove a dataset from disk", function(){
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_dataset: Dataset = {id_key: "fake", sections: [fake_section]};
        controller.save("fake", fake_dataset);

        controller.remove("fake");

        expect(function(){
                fs.statSync("./data/fake.json");
            }
        ).to.throw(Error);
    });

    it("Should be able to remove a dataset from memory", function(){
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_dataset: Dataset = {id_key: "fake", sections: [fake_section]};
        var fake_dataset2: Dataset = {id_key: "fake2", sections: [fake_section, fake_section]};

        controller.save("fake", fake_dataset);
        controller.save("fake2", fake_dataset2);

        controller.remove("fake");

        expect(controller.datasets.sets.length).to.equal(1);
    });
});
