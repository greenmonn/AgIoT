const socket = io();

let updateCount = 0;
let timestamp = (new Date).getTime();
let sumUpdatePeriod = 0;
let prevNumber = null;

socket.on('updateCell', function (cell) {
    const $cell = $("#cell-" + cell.number);
    const $highlight = $("#cell-" + cell.number + " > div");

    $cell.css("background-image",
        `url("${cell.image}")`);


    $highlight.css("border", "1px solid red");
    setTimeout(function() {
        $highlight.css("border", "0px");
    }, 300);


    $("#changed_cell_number").text(cell.number);
    $("#update_count").text(++updateCount);

    let currentTime = (new Date).getTime();
    let period = currentTime - timestamp;

    sumUpdatePeriod += period;

    timestamp = currentTime;

    if (period > 100) {
        $("#update_period").text(period.toFixed(2));
    }

    $("#sum_update_period").text(sumUpdatePeriod.toFixed(2));
    $("#average_update_period").text((sumUpdatePeriod / updateCount).toFixed(2));
});