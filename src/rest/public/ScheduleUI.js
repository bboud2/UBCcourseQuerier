/**
 * Created by Ben on 11/25/2016.
 */

$('#submit-schedule').click(function(){

    var roomWHERE= UIHelpers.convertToWHERE(rules_room_schedule);
    var courseWHERE = UIHelpers.convertToWHERE(rules_course_schedule);
    console.log("WHERE for room:");
    console.log(roomWHERE);
    console.log("WHERE for course:");
    console.log(courseWHERE);
});

var rules_room_schedule = {
    condition: 'AND',
    rules: [{
        id: 'rooms_shortname',
        operator: 'equal',
        value: "ESB"
    }]
};



$('#builder-room-schedule').queryBuilder({
    plugins: [
        'bt-tooltip-errors',
        'not-group'],

    filters: [{
        id: 'rooms_fullname',
        label: 'FullName',
        type: 'string',
        operators:['equal']
    }, {
        id: 'rooms_shortname',
        label: 'ShortName',
        type: 'string',
        operators: ['equal']
    }, {
        id: 'rooms_number',
        label: 'Room Number',
        type: 'string',
        operators: ['equal']
    },{
        id: 'rooms_name',
        label: 'Room Name',
        type: 'string',
        operators: ['equal']
    },{
        id: 'rooms_address',
        label: 'Address',
        type: 'string',
        operators: ['equal']
    },{
        id: 'rooms_lat',
        label: 'Latitude',
        type: 'double',
        validation: {
            min: 0,
            step: 0.01
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'rooms_lon',
        label: 'Longitude',
        type: 'double',
        validation: {
            min: 0,
            step: 0.01
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'rooms_seats',
        label: 'Number of Seats',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'rooms_type',
        label: 'Room Type',
        type: 'string',
        operators: ['equal']
    },{
        id: 'rooms_furniture',
        label: 'Furniture',
        type: 'string',
        operators: ['equal']
    },{
        id: 'rooms_href',
        label: 'Website',
        type: 'string',
        operators: ['equal']
    }],

    rules: rules_room_schedule
});



var rules_course_schedule = {
    condition: 'AND',
    rules: [{
        id: 'courses_dept',
        operator: 'equal',
        value: "cpsc"
    }]
};

    $('#builder-course-schedule').queryBuilder({
    plugins: [
        'bt-tooltip-errors',
        'not-group'],

    filters: [{
        id: 'courses_dept',
        label: 'Department',
        type: 'string',
        operators:['equal']
    }, {
        id: 'courses_id',
        label: 'ID',
        type: 'string',
        operators: ['equal']
    },{
        id: 'courses_avg',
        label: 'Average',
        type: 'double',
        validation: {
            min: 0,
            step: 0.01
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'courses_instructor',
        label: 'Instructor',
        type: 'string',
        operators: ['equal']
    },{
        id: 'courses_title',
        label: 'Title',
        type: 'string',
        operators: ['equal']
    },{
        id: 'courses_pass',
        label: 'Pass',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'courses_fail',
        label: 'Fail',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'courses_audit',
        label: 'Audit',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    }],

    rules: rules_course_schedule
});



