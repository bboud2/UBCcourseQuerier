/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
import {Dataset, Course, Section} from "../src/controller/DatasetController";

describe("DatasetController", function () {

    var controller: DatasetController;

    beforeEach(function () {
        controller = new DatasetController();
    });

    afterEach(function () {
    });

    it("Should be able to receive a Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
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
        var fake_section: Section = {avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {dept: "test dept", id: "100"};
        fake_course[0] = fake_section;
        var fake_course2: Course = {dept: "test_dept2", id: "101"};
        fake_course2[0] = fake_section;
        var fake_dataset: Dataset = {};
        fake_dataset[0] = fake_course;
        fake_dataset[1] = fake_course2;
        controller.save("fake", fake_dataset);
        let result = controller.getDataset("fake");
        expect(result).to.equal(fake_dataset);
    });

    it("Should return the correct dataset if the object is present in memory", function() {
        var fake_section: Section = {avg: 50, professor: "no one", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {dept: "test dept", id: "100"};
        fake_course[0] = fake_section;
        var fake_course2: Course = {dept: "test_dept2", id: "101"};
        fake_course2[0] = fake_section;
        var fake_dataset: Dataset = {};
        fake_dataset[0] = fake_course;
        fake_dataset[1] = fake_course2;
        controller.datasets["fake2"] = fake_dataset;
        let result = controller.getDataset("fake2");
        expect(result).to.equal(fake_dataset);
    });

});
