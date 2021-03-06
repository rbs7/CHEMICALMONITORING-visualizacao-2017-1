var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%m/%d/%y %H:%M");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.DateTime); })
    .y0(height)
    .y1(function(d) { return y(d.Reading); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.DateTime); })
    .y0(height2)
    .y1(function(d) { return y2(d.Reading); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var xAxisGroup = focus
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0, " + height + ")");

var xAxisGroup2 = context
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0, " + height2 + ")");

var yAxisGroup = focus
    .append("g")
    .attr("class", "yAxis");

var trans = svg.transition().duration(750);

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".area").attr("d", area);
    //focus.select(".axis--x").call(xAxis);
    xAxisGroup.call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select(".area").attr("d", area);
    //focus.select(".axis--x").call(xAxis);
    xAxisGroup.call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
    d.DateTime = parseDate(d.DateTime);
    d.Reading = +d.Reading;
    return d;
}

var month = 3;
var chemical = "Appluimonia";

d3.csv("sensor_data.csv", type, function(error, data) {
    if (error) throw error;

    var data = data.filter(function(d) { return chemical.localeCompare(d.Chemical) == 0/*&& d.Monitor == 3*/ && d.DateTime.getMonth() == month})

    //Soma as leituras de todos os sensores
    var dataaux = [];
    dataaux[0] = data[0];
    for (var i = 1, j = 0; i < data.length; i++) {
        //debugger;
        if (data[i].DateTime.toString() === data[i-1].DateTime.toString()) {
            dataaux[j].Reading += data[i].Reading;
        } else {
            j++;
            dataaux[j] = data[i];
        }
    }
    data = dataaux;

    //debugger;

    x.domain(d3.extent(data, function(d) { return d.DateTime; }));
    y.domain([0, d3.max(data, function(d) { return d.Reading; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    xAxisGroup.call(xAxis);
    xAxisGroup2.call(xAxis2);
    yAxisGroup.call(yAxis);

    focus
        .append("path")
        .datum(data)
        .attr("id", "foco")
        .attr("class", "area")
        .attr("d", area);

    context
        .append("path")
        .datum(data)
        .attr("id", "contexto")
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "brush")
        //.attr("id", "brushid")
        .call(brush)
        .call(brush.move, x.range());

    svg
        .append("rect")
        .attr("class", "zoom")
        //.attr("id", "zoomid")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
});

function update() {

    //debugger;
    d3.csv("sensor_data.csv", type, function(error, data) {
        if (error) throw error;    
        //debugger;
        var data = data.filter(function(d) { return chemical.localeCompare(d.Chemical) == 0/*&& d.Monitor == 3*/ && d.DateTime.getMonth() == month})

        //Soma as leituras de todos os sensores
        var dataaux = [];
        dataaux[0] = data[0];
        for (var i = 1, j = 0; i < data.length; i++) {
            //debugger;
            if (data[i].DateTime.toString() === data[i-1].DateTime.toString()) {
                dataaux[j].Reading += data[i].Reading;
            } else {
                j++;
                dataaux[j] = data[i];
            }
        }
        data = dataaux;

        //debugger;

        x.domain(d3.extent(data, function(d) { return d.DateTime; }));
        y.domain([0, d3.max(data, function(d) { return d.Reading; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        xAxisGroup.transition(trans).call(xAxis);
        xAxisGroup2.transition(trans).call(xAxis2);
        yAxisGroup.transition(trans).call(yAxis);

        /*
        area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x(d.DateTime); })
            .y0(height)
            .y1(function(d) { return y(d.Reading); });

        area2 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x2(d.DateTime); })
            .y0(height2)
            .y1(function(d) { return y2(d.Reading); });
        */
        //debugger;

        focus
            .select("#foco")
            .datum(data)
            .transition(trans)
            .attr("class", "area")
            .attr("d", area);

        context
            .select("#contexto")
            .datum(data)
            .transition(trans)
            .attr("class", "area")
            .attr("d", area2);

    });
}
