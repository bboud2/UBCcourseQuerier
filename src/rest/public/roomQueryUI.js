/**
 * Created by Ben on 11/24/2016.
 */

var roomOrderProps = {};

function hideRoomGroupAndApply(){
    $('#room-group-apply').hide();
}

$('#room-group-show').click(function(){
    $('#room-group-apply').show();
    $('#room-get').hide();
    handleRoomQueryChecks();
});

$('#room-group-hide').click(function() {
    $('#room-get').show();
    $('#room-group-apply').hide();
    handleRoomQueryChecks();
});

$('.checkbox-room').change(function (){
    handleRoomQueryChecks();
});

function handleRoomQueryChecks(){
    console.log("called Handle Query Checks");
    toggleRoomOrderProps();
    updateRoomOrderSelect();
}

function toggleRoomOrderProps(){
    console.log("called toggleRoomOrderProps");

    roomOrderProps = {};
    if($('#room-group-show').is(':checked')){
        $('#room-checks-group input:checked').each(function(obj,i) {
            roomOrderProps[i.name] = i.value;
        });
        $('#new-room-applies').find('div').each(function(i,obj){
            roomOrderProps[obj.title] = obj.title;
        });
    }
    else{
        $('#room-get input:checked').each(function(obj,i) {
            roomOrderProps[i.name] = i.value;
        });
    }

    console.log(JSON.stringify(roomOrderProps));
}





function updateRoomOrderSelect(){
    $('#room-orders div').each(function (i,obj) {
        var targetSel = obj.children[0];
        clearSel(targetSel);
        for (var value in roomOrderProps) {
            console.log('in second loop');
            $('<option />', {value: roomOrderProps[value], text: value}).appendTo(targetSel);
        }
    })
}





$('#new-Room-Order').click(function() {
    generateNewRoomOrder();
});

function generateNewRoomOrder(){
    var container = $('#room-orders');
    var inputs = container.find('div');
    var id = inputs.length+1;
    var newDiv = $('<div   />', {id: 'courseOrder'+id}).appendTo(container);
    $('<select />').appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        handleRoomQueryChecks();
    }).appendTo(newDiv);
    updateRoomOrderSelect();
}








$('#save-Apply-room').click(function() {
    addApplyRoom($('#new-Apply-room').val());
    handleRoomQueryChecks();
});

function addApplyRoom(name){
    var container = $('#new-room-applies');
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
    var operatorSelect = $('<select />');
    var roomSelect = $('<select />');
    for(var val in courseFields) {
        $('<option />', {value: courseFields[val], text: val}).appendTo(roomSelect);
    }
    for(var value in applyOperators){
        $('<option />', {value: value, text: applyOperators[value]}).appendTo(operatorSelect);
    }
    var newDiv = $('<div   />', {id: id, title:name}).appendTo(container);
    $('<p />',{text: name}).appendTo(newDiv);
    roomSelect.appendTo(newDiv);
    operatorSelect.appendTo(newDiv);
    $('<button />', {class: "btn-danger", text:"Remove"}).click(function () {
        $(newDiv).remove();
        delete roomOrderProps[name];
        handleRoomQueryChecks();
    }).appendTo(newDiv);
    $('<br />').appendTo(newDiv);
}

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