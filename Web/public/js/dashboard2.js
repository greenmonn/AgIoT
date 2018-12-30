$(document).ready(function () {
    "use strict";

    // Real Time chart
    var data = [],
        totalPoints = 500;

    function getPeriodData() {
        if (data.length > 0) data = data.slice(1);
        // Do a random walk
        while (data.length < totalPoints) {
            var y = parseInt($("#update_period").text());
            data.push(y);
            console.log(y);
        }
        // Zip the generated y values with the x values 
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }
        return res;
    }

    // Set up the control widget
    var updateInterval = 300;
    var plot = $.plot("#placeholder", [getPeriodData()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 3000
        },
        xaxis: {
            show: false
        },
        colors: ["#fff"],
        grid: {
            color: "rgba(255, 255, 255, 0.3)",
            hoverable: true,
            borderWidth: 0

        },
        tooltip: true,
        tooltipOpts: {
            content: "Period: %y",
            defaultTheme: false
        }
    });

    function update() {
        plot.setData([getPeriodData()]);
        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot.draw();
        setTimeout(update, updateInterval);
    }

    $(window).resize(function () {
        $.plot($('#placeholder'), [getPeriodData()]);
    });
    update();
});

