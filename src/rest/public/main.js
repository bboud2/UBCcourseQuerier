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

    $("#submitCourseQuery").click(function (e) {
        var query = {};
        query.AS = "TABLE";
        query.WHERE = UIHelpers.convertToWHERE($("#builder-course").queryBuilder('getRules'));
        if ($("#courseOrder1").length) {
            var order = {};
            order.dir = $('input[name=courses_order]:checked', '#courses_order').val();
            var keys = [];
            var i = 1;
            while ($("#courseOrder" + i).length) {
                keys.push($("#courseOrder" + i)[0]["firstChild"].selectedOptions[0]["value"]);
                i++;
            }
            order.keys = keys;
            query.ORDER = order;
        }
        if ($('input[name=include]:checked', '#courses_group_apply').val() == "Include Group/Apply") {
            var groups = [];
            var gets = [];
            $("#courses_group input:checkbox:checked").each(function() {
                groups.push($(this)[0].value);
                gets.push($(this)[0].value);
            });
            query.GROUP = groups;
            var applys = [];
            var i = 1;
            while ($("#courseApply" + i).length) {
                var curr = {};
                var title = $("#courseApply" + i)[0].title;
                gets.push(title);
                curr[title] = {};
                curr[title][$("#courseApply" + i + "_operator")[0]["value"]] = $("#courseApply" + i + "_field")[0]["value"];
                applys.push(curr);
                console.log(curr);
                i++;
            }
            query.APPLY = applys;
        } else {
            var gets = [];
            $("#courses_get input:checkbox:checked").each(function() {
                gets.push($(this)[0].value);
            });
        }
        query.GET = gets;
        try {
            $("#queryCourseModal").modal("toggle");
            $.ajax("/query", {type:"POST", data: JSON.stringify(query), contentType: "application/json", dataType: "json", success: function(data) {
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
        if (data.length > 0) {
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
            $("#displayModal").modal("toggle");
            var container = d3.select("#display_table");
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
        } else {
            spawnErrorModal("Empty results set", "No sections match query... please try again.");
        }

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


