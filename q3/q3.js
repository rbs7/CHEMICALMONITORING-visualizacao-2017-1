var svg = d3.select("svg"),
    margin = {top: 11, right: 10, bottom: 180+13, left: 13},
    margin2 = {top: 740, right: 30, bottom: 30, left: 20},
    width = +svg.attr("width") - margin.left - margin.right,
    width2 = +svg.attr("width") - margin2.left - margin2.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%m/%d/%y %H:%M");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width2]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width2, height2]])
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

var sensores = [
    {x:62, y:21, r:3},
    {x:66, y:35, r:3},
    {x:76, y:41, r:3},
    {x:88, y:45, r:3},
    {x:103, y:43, r:3},
    {x:102, y:22, r:3},
    {x:89, y:3, r:3},
    {x:74, y:7, r:3},
    {x:119, y:42, r:3}
];

var globaldata;
function makeglobaldata(data) {
    globaldata = data;
}

var to_draw, sensorSum;
var month = 3, chemical = "Appluimonia";

function contsensor(data, interval) {
  var dataaux = data.filter(function(d) { return d.DateTime.getTime() >= interval[0].getTime() && d.DateTime.getTime() <= interval[1].getTime() });
  var sensorSum = dataaux.reduce(function (previous,d) { previous[d.Monitor-1]+=d.Reading; return previous; }, [0,0,0,0,0,0,0,0,0]);
  return sensorSum;
}

d3.csv("sensor_data.csv", type, function(error,data) {
    if (error) throw error;
    makeglobaldata(data);

    to_draw = globaldata.filter(function(d) { return d.Chemical == chemical && d.DateTime.getMonth() == month})

    x.domain(d3.extent(to_draw, function(d) { return d.DateTime; }));
    y.domain([0, d3.max(to_draw, function(d) { return d.Reading; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    sensorSum = contsensor(to_draw, x.domain());

    focus.selectAll("circle")
        .data(sensores)
        .enter()
        .append("circle")
        .attr("class", "area")
        .attr("cy", function(d) { return height-d.y*height/200;})
        .attr("cx", function(d) { return d.x*width/200;})
        .attr("r",  function(d,i) { return 3*Math.sqrt(sensorSum[i]);})
        ;

    context.append("path")
        .datum(to_draw)
        .attr("id", "contexto")
        .attr("class", "area")
        .attr("d", area2);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x2.range().map(function(d) {return d/50;}));

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
});

var trans = svg.transition().duration(200);

function update() {

    to_draw = globaldata.filter(function(d) { return d.Chemical == chemical && d.DateTime.getMonth() == month})

    x.domain(d3.extent(to_draw, function(d) { return d.DateTime; }));
    y.domain([0, d3.max(to_draw, function(d) { return d.Reading; })]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    sensorSum = contsensor(to_draw, x.domain());

    focus.selectAll("circle")
        .data(sensores)
        .enter()
        .append("circle")
        .attr("class", "area")
        .attr("cy", function(d) { return height-d.y*height/200;})
        .attr("cx", function(d) { return d.x*width/200;})
        .attr("r",  function(d,i) { return 3*Math.sqrt(sensorSum[i]);});

    context.select("#contexto")
        .datum(to_draw)
        .transition(trans)
        .attr("class", "area")
        .attr("d", area2);

    context.select("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .transition(trans)
        .call(xAxis2);

    focus.selectAll("circle")
        .exit()
        .remove();
}

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  //focus.selectAll(".area").attr("d", area);
  context.select(".area").attr("d", area2);
  var sensorSum = contsensor(to_draw, x.domain());
  focus.selectAll("circle").attr("r", function(d,i) { return 3*Math.sqrt(sensorSum[i]);});
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  var sensorSum = contsensor(to_draw, x.domain());
  focus.selectAll("circle").attr("r", function(d,i) { return 3*Math.sqrt(sensorSum[i]);});
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
  d.Chemical = d.Chemical;
  d.Monitor = +d.Monitor;
  d.DateTime = parseDate(d.DateTime);
  d.Reading = +d.Reading;
  return d;
}
