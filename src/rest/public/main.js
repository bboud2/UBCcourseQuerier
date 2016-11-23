
$(function () {
    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        var zip = $("#datasetZip").prop('files')[0];
        var data = new FormData();
        data.append("zip", zip);
        $.ajax("/dataset/" + id,
            {
                type: "PUT",
                data: data,
                processData: false
            }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });




    $("#datasetRm").click(function () {
        var id = $("#datasetId").val();
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $(".queryForm").submit(function (e) {
        e.preventDefault();
        var query = $("#query").val();
        try {
            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title,
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").style("margin", "auto");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    $('#save-Apply-courses').click(function() {
        addApplyCourse($('#new-Apply-course').val());
    });

    function addGROUPCourseBox(name){
        var container = $('#new-groups-courses');
        var inputs = container.find('input');
        var id = inputs.length+1;

        $('<input />', { type: 'checkbox', id: 'getCheck'+id, value: name}).appendTo(container);
        $('<label />', { 'for': 'cb'+id, text: name }).appendTo(container);
    }

    function addApplyCourse(name){
        var container = $('#new-course-applies');
        var inputs = container.find('div');
        var id = inputs.length+1;
        console.log('declared container ect..');
        console.log(id);
        console.log(name);

        var courseFields = {
            'Department': 'courses_avg',
            'ID': 'courses_id',
            'Average': 'courses_avg',
            'Instructor': 'courses_instructor',
            'Title': 'courses_title',
            'Pass': 'courses_pass',
            'Fail': 'courses_fail',
            'Audit': 'courses_audit'
        };
        var applyOperators = {
            'COUNT': 'COUNT',
            'MAX' : 'MAX',
            'MIN' : 'MIN',
            'AVG' : 'AVG'
        };

        var operatorSelect = $('<select />');
        var courseSelect = $('<select />');
        console.log('declared two empty selects');
        for(var val in courseFields) {
            console.log('in first loop');
            $('<option />', {value: val, text: courseFields[val]}).appendTo(courseSelect);
        }
        for(var value in applyOperators){
            console.log('in second loop');
            $('<option />', {value: value, text: applyOperators[value]}).appendTo(operatorSelect);
        }
        console.log('our of last loop');
        var newDiv = $('<div   />', {id: 'applyCourse'+id}).appendTo(container);
        $('<p />',{text: name}).appendTo(newDiv);
        console.log('added p');
        courseSelect.appendTo(newDiv);
        console.log('added courseSelect');
        operatorSelect.appendTo(newDiv);
        console.log('added opperatorSelect');
        $('<br />').appendTo(newDiv);
        console.log('added br');

    }



    var rules_course = {
        condition: 'AND',
        rules: [{
            id: 'courses_dept',
            operator: 'equal',
            value: "CPSC"
        }]
    };

    $('#builder-course').queryBuilder({
        plugins: [
            'bt-tooltip-errors',
            'not-group'],

        filters: [{
            id: 'courses_dept',
            label: 'Department',
            type: 'string',
            operators:['equal', 'not_equal']
        }, {
            id: 'courses_id',
            label: 'ID',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'courses_avg',
            label: 'Average',
            type: 'double',
            validation: {
                min: 0,
                step: 0.01
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'courses_instructor',
            label: 'Instructor',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'courses_title',
            label: 'Title',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'courses_pass',
            label: 'Pass',
            type: 'integer',
            validation: {
                min: 0,
                step: 1
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'courses_fail',
            label: 'Fail',
            type: 'integer',
            validation: {
                min: 0,
                step: 1
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'courses_audit',
            label: 'Audit',
            type: 'integer',
            validation: {
                min: 0,
                step: 1
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        }],

        rules: rules_course
    });

    var rules_room = {
        condition: 'AND',
        rules: [{
            id: 'rooms_fullname',
            operator: 'equal',
            value: "ASDF"
        }]
    };

    $('#builder-room').queryBuilder({
        plugins: [
            'bt-tooltip-errors',
            'not-group'],

        filters: [{
            id: 'rooms_fullname',
            label: 'FullName',
            type: 'string',
            operators:['equal', 'not_equal']
        }, {
            id: 'rooms_shortname',
            label: 'ShortName',
            type: 'string',
            operators: ['equal', 'not_equal']
        }, {
            id: 'rooms_number',
            label: 'Room Number',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'rooms_name',
            label: 'Room Name',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'rooms_address',
            label: 'Address',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'rooms_lat',
            label: 'Latitude',
            type: 'double',
            validation: {
                min: 0,
                step: 0.01
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'rooms_lon',
            label: 'Longitude',
            type: 'double',
            validation: {
                min: 0,
                step: 0.01
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'rooms_seats',
            label: 'Number of Seats',
            type: 'integer',
            validation: {
                min: 0,
                step: 1
            },
            operators: ['equal', 'not_equal', 'less', 'greater']
        },{
            id: 'rooms_type',
            label: 'Room Type',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'rooms_furniture',
            label: 'Furniture',
            type: 'string',
            operators: ['equal', 'not_equal']
        },{
            id: 'rooms_href',
            label: 'Website',
            type: 'string',
            operators: ['equal', 'not_equal']
        }],

        rules: rules_room
    });

    $('#btn-reset-course').on('click', function() {
        $('#builder-course').queryBuilder('reset');
    });

    $('#btn-set-course').on('click', function() {
        $('#builder-course').queryBuilder('setRules', rules_course);
    });

    $('#btn-get-course').on('click', function() {
        var result = $('#builder-course').queryBuilder('getRules');

        if (!$.isEmptyObject(result)) {
            alert(JSON.stringify(result, null, 2));
        }
    });
});


