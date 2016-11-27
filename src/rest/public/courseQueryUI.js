/**
 * Created by Ben on 11/24/2016.
 */



$('.checkbox-course').change(function (){
    console.log("change on checkbox-align");
    handleCourseQueryChecks();
});

$('#course-group-show').click(function(){
    $('#course-group-apply').show();
    $('#course-get').hide();
    handleCourseQueryChecks();
});

$('#course-group-hide').click(function(){
    $('#course-get').show();
    $('#course-group-apply').hide();
    handleCourseQueryChecks();
});

var courseOrderProps = {};

$('#new-Course-Order').click(function() {
    generateNewCourseOrder();
});

function generateNewCourseOrder(){
    // console.log("called genereateNEwCourseOrder");
    var container = $('#course-orders');
    var inputs = container.find('div');
    var id = inputs.length+1;
    var newDiv = $('<div   />', {id: 'courseOrder'+id}).appendTo(container);
    $('<select />').appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        handleCourseQueryChecks();
    }).appendTo(newDiv);
    updateCourseOrderSelect();
}

function hideCourseGroupAndApply(){
    $('#course-group-apply').hide();
}

function handleCourseQueryChecks(){
    // console.log("called Handle Query Checks");
    toggleCourseOrderProps();
    updateCourseOrderSelect();
}

function toggleCourseOrderProps(){
    // console.log("called toggleCourseORderProps");

    courseOrderProps = {};
    if($('#course-group-show').is(':checked')){
        $('#course-checks-group input:checked').each(function(obj,i) {
            courseOrderProps[i.name] = i.value;
        });
        $('#new-course-applies').find('div').each(function(i,obj){
            courseOrderProps[obj.title] = obj.title;
        });
    }
    else{
        $('#course-get input:checked').each(function(obj,i) {
            courseOrderProps[i.name] = i.value;
        });
    }

    // console.log(JSON.stringify(courseOrderProps));
}

function updateCourseOrderSelect(){
    $('#course-orders div').each(function (i,obj) {
        var targetSel = obj.children[0];
        clearSel(targetSel);
        for (var value in courseOrderProps) {
            console.log('in second loop');
            $('<option />', {value: courseOrderProps[value], text: value}).appendTo(targetSel);
        }
    })
}

function clearSel(sel){
    $(sel).find('option').each(function (){
        $(this).remove();
    })
}

$('#save-Apply-courses').click(function() {
    addApplyCourse($('#new-Apply-course').val());
    handleCourseQueryChecks();
});

function addApplyCourse(name){
    var container = $('#new-course-applies');
    var inputs = container.find('div');
    var id = inputs.length+1;

    var courseFields = {
        'Department': 'courses_dept',
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
    var operatorSelect = $('<select />', {id: "courseApply"+id+"_operator"});
    var courseSelect = $('<select />', {id: "courseApply"+id+"_field"});
    for(var val in courseFields) {
        $('<option />', {value: courseFields[val], text: val}).appendTo(courseSelect);
    }
    for(var value in applyOperators){
        $('<option />', {value: value, text: applyOperators[value]}).appendTo(operatorSelect);
    }
    var newDiv = $('<div   />', {id: "courseApply"+id, title:name}).appendTo(container);
    $('<p />',{text: name}).appendTo(newDiv);
    courseSelect.appendTo(newDiv);
    operatorSelect.appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        delete courseOrderProps[name];
        handleCourseQueryChecks();
    }).appendTo(newDiv);
    $('<br />').appendTo(newDiv);
}


var rules_course = {
    condition: 'AND',
    rules: [{
        id: 'courses_dept',
        operator: 'equal',
        value: "cpsc"
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

