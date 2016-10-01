/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";
import fs = require('fs');

import JSZip = require('jszip');
import {expect} from 'chai';
import {Dataset, Course, Section, Datasets} from "../src/controller/DatasetController";
import {error} from "util";

describe("DatasetController", function () {

    var controller: DatasetController;

    beforeEach(function () {
        controller = new DatasetController();
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
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {id_key: "test dept100", dept: "test dept", course_num: "100", sections: []};
        fake_course.sections.push(fake_section);
        var fake_course2: Course = {id_key: "test dept100", dept: "test_dept2", course_num: "101", sections: []};
        fake_course2.sections.push(fake_section);
        var fake_dataset: Dataset = {id_key: "fake", courses: []};
        fake_dataset.courses.push(fake_course);
        fake_dataset.courses.push(fake_course);
        controller.save("fake", fake_dataset);
        let result = controller.getDataset("fake");
        expect(result).to.equal(fake_dataset);
    });

    it("Should return the correct dataset if the object is present in memory", function() {
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {id_key: "test dept100", dept: "test dept", course_num: "100", sections: []};
        fake_course.sections.push(fake_section);
        var fake_course2: Course = {id_key: "test dept100", dept: "test_dept2", course_num: "101", sections: []};
        fake_course2.sections.push(fake_section);
        var fake_dataset: Dataset = {id_key: "fake2", courses: []};
        fake_dataset.courses.push(fake_course);
        fake_dataset.courses.push(fake_course);
        controller.datasets.sets.push(fake_dataset);
        let result = controller.getDataset("fake2");
        expect(result).to.equal(fake_dataset);
    });


    it("Should be able to delete a dataset from disk", function(){
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {id_key: "test dept100", dept: "test dept", course_num: "100", sections: []};
        fake_course.sections.push(fake_section);
        var fake_course2: Course = {id_key: "test dept100", dept: "test_dept2", course_num: "101", sections: []};
        fake_course2.sections.push(fake_section);
        var fake_dataset: Dataset = {id_key: "fake", courses: []};
        fake_dataset.courses.push(fake_course);
        fake_dataset.courses.push(fake_course);
        controller.save("fake", fake_dataset);

        controller.delete("fake");

        expect(function(){
            fs.statSync("./data/fake.json");
        }
        ).to.throw(Error);
    })

    it("Should be able to delete a dataset from memory", function(){
        var fake_section: Section = {id_key: "0", dept: "w.e", course_num: "100", avg: 50, professor: "no one", title: "nothing", pass: 50, fail: 50, audit: 5};
        var fake_course: Course = {id_key: "test dept100", dept: "test dept", course_num: "100", sections: []};
        fake_course.sections.push(fake_section);
        var fake_course2: Course = {id_key: "test dept100", dept: "test_dept2", course_num: "101", sections: []};
        fake_course2.sections.push(fake_section);
        var fake_dataset: Dataset = {id_key: "fake", courses: []};
        fake_dataset.courses.push(fake_course);
        fake_dataset.courses.push(fake_course);
        var fake_dataset2: Dataset = {id_key: "fake2", courses: []};
        fake_dataset2.courses.push(fake_course);
        fake_dataset2.courses.push(fake_course);

        controller.save("fake", fake_dataset);

        controller.delete("fake2");

        expect(controller.datasets.sets.length).to.equal(1);
    })
});
