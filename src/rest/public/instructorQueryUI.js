/**
 * Created by Ben on 11/24/2016.
 */



$('.checkbox-instructor').change(function (){
    handleInstructorQueryChecks();
});

$('#instructor-group-show').click(function(){
    $('#instructor-group-apply').show();
    $('#instructor-get').hide();
    handleInstructorQueryChecks();
});

$('#instructor-group-hide').click(function(){
    $('#instructor-get').show();
    $('#instructor-group-apply').hide();
    handleInstructorQueryChecks();
});

var instructorOrderProps = {};

$('#new-Instructor-Order').click(function() {
    generateNewInstructorOrder();
});

function generateNewInstructorOrder(){
    // console.log("called genereateNEwInstructorOrder");
    var container = $('#instructor-orders');
    var inputs = container.find('div');
    var id = inputs.length+1;
    var newDiv = $('<div   />', {id: 'instructorOrder'+id}).appendTo(container);
    $('<select />').appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        handleInstructorQueryChecks();
    }).appendTo(newDiv);
    updateInstructorOrderSelect();
}

function hideInstructorGroupAndApply(){
    $('#instructor-group-apply').hide();
}

function handleInstructorQueryChecks(){
    // console.log("called Handle Query Checks");
    toggleInstructorOrderProps();
    updateInstructorOrderSelect();
}

function toggleInstructorOrderProps(){
    // console.log("called toggleInstructorORderProps");

    instructorOrderProps = {};
    if($('#instructor-group-show').is(':checked')){
        $('#instructor-checks-group input:checked').each(function(obj,i) {
            instructorOrderProps[i.name] = i.value;
        });
        $('#new-instructor-applies').find('div').each(function(i,obj){
            instructorOrderProps[obj.title] = obj.title;
        });
    }
    else{
        $('#instructor-get input:checked').each(function(obj,i) {
            instructorOrderProps[i.name] = i.value;
        });
    }

    // console.log(JSON.stringify(instructorOrderProps));
}

function updateInstructorOrderSelect(){
    $('#instructor-orders div').each(function (i,obj) {
        var targetSel = obj.children[0];
        clearSel(targetSel);
        for (var value in instructorOrderProps) {
            console.log('in second loop');
            $('<option />', {value: instructorOrderProps[value], text: value}).appendTo(targetSel);
        }
    })
}

function clearSel(sel){
    $(sel).find('option').each(function (){
        $(this).remove();
    })
}

$('#save-Apply-instructors').click(function() {
    addApplyInstructor($('#new-Apply-instructor').val());
    handleInstructorQueryChecks();
});

function addApplyInstructor(name){
    var container = $('#new-instructor-applies');
    var inputs = container.find('div');
    var id = inputs.length+1;

    var instructorFields = {
        'Name': 'instructors_name',
        'Department': 'instructors_department',
        'Sections Taught': 'instructors_numSections',
        'Courses Taught': 'instructors_numCourses',
        'Total Students': 'instructors_totalStudents',
        'Total Passers': 'instructors_totalPassers',
        'Total Failures': 'instructors_totalFailures',
        'Total Auditors': 'instructors_totalAuditors',
        'Average Grade': 'instructors_studentAvg',
        'Percentage Passed': 'instructors_passPercentage',
        'Student Success Metric': 'instructors_studentSuccessMetric',
        'RMP: Quality': 'instructors_rmpQuality',
        'RMP: Helpfulness': 'instructors_rmpHelpfulness',
        'RMP: Easiness': 'instructors_rmpEasiness',
        'RMP: Chili': 'instructors_rmpChili'
    };

    var applyOperators = {
        'COUNT': 'COUNT',
        'MAX' : 'MAX',
        'MIN' : 'MIN',
        'AVG' : 'AVG'
    };
    var operatorSelect = $('<select />', {id: "instructorApply"+id+"_operator"});
    var instructorSelect = $('<select />', {id: "instructorApply"+id+"_field"});
    for(var val in instructorFields) {
        $('<option />', {value: instructorFields[val], text: val}).appendTo(instructorSelect);
    }
    for(var value in applyOperators){
        $('<option />', {value: value, text: applyOperators[value]}).appendTo(operatorSelect);
    }
    var newDiv = $('<div   />', {id: "instructorApply"+id, title:name}).appendTo(container);
    $('<p />',{text: name}).appendTo(newDiv);
    instructorSelect.appendTo(newDiv);
    operatorSelect.appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        delete instructorOrderProps[name];
        handleInstructorQueryChecks();
    }).appendTo(newDiv);
    $('<br />').appendTo(newDiv);
}


var rules_instructor = {
    condition: 'AND',
    rules: [{
        id: 'instructors_department',
        operator: 'equal',
        value: "cpsc"
    }]
};

$('#builder-instructor').queryBuilder({
    plugins: [
        'bt-tooltip-errors',
        'not-group'],

    filters: [{
        id: 'instructors_name',
        label: 'Name',
        type: 'string',
        operators:['equal']
    }, {
        id: 'instructors_department',
        label: 'Department',
        type: 'string',
        operators: ['equal']
    },{
        id: 'instructors_numSections',
        label: 'Sections Taught',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_numCourses',
        label: 'Courses Taught',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_totalStudents',
        label: 'Total Students',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_totalPassers',
        label: 'Total Passers',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_totalFailures',
        label: 'Total Failures',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_totalAuditors',
        label: 'Total Auditors',
        type: 'integer',
        validation: {
            min: 0,
            step: 1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_studentAvg',
        label: 'Average Grade',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_passPercentage',
        label: 'Percentage Passed',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_studentSuccessMetric',
        label: 'Student Success Metric',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_rmpQuality',
        label: 'RMP: Quality',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_rmpHelpfulness',
        label: 'RMP: Helpfulness',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_rmpEasiness',
        label: 'RMP: Easiness',
        type: 'double',
        validation: {
            min: 0,
            step: 0.1
        },
        operators: ['equal', 'less', 'greater']
    },{
        id: 'instructors_rmpChili',
        label: 'RMP: Chili',
        type: 'string',
        operators: ['equal']
    }],

    rules: rules_instructor
});

