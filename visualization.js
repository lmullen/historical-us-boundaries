queue()
.defer(d3.json, "us.json")
.defer(d3.json, "coast.json")
.await(ready);

var margin = {top: 10, right: 20, bottom: 10, left: 20};
var width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
maxZoom = 4;
var currentUnit = d3.select(null);

var svg = d3.select("#viz").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.on("click", stopped, true);

slider_height = 20;

var slider_svg = d3.select("#slider").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", slider_height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dispDate = new Date(1783,8,3);

// d3.select("#date").html("<strong>" + niceDate(dispDate) + "</strong>");

var tooltip = d3.select("#viz").append("div")
.classed("tooltip", true)
.classed("hidden", true);

// var projection = d3.geo.mercator()
var projection = d3.geo.albers()
.scale(1100)
.translate([ 0.5 * width, 0.5 * height]);

var path = d3.geo.path()
.projection(projection);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, maxZoom])
    .on("zoom", zoomed);

// svg
//     .call(zoom) // delete this line to disable free zooming
//     .call(zoom.event);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);


function ready(error, us, coast) { 

  var states = topojson.feature(us, us.objects.states);
  var coastline  = topojson.feature(coast, coast.objects.coast);

  svg
  .selectAll(".coast")
  .data(coastline.features)
  .enter()
  .append("path")
  .attr("class", "coast")
  .attr("d", path);

  svg
  .selectAll(".unit")
  .data(states.features)
  .enter()
  .append("path")
  .attr("class", function(d) { 
    return "unit " + d.id + " " + d.properties.TERR_TYPE; 
  })
  .attr("d", path)
  .on("click", clicked);

  // Slider
  var start = new Date(1783, 8, 3),
  end   = new Date(1912, 11, 31);

  var x = d3.time.scale()
  .domain([start, end])
  .range([0, width])
  .clamp(true);

  var brush = d3.svg.brush()
  .x(x)
  .extent([0, 0])
  .on("brush", brushed);

  slider_svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + slider_height / 2 + ")")
  .call(d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d) { return d.getFullYear(); })
        .tickSize(0)
        .tickPadding(12))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

        var slider = slider_svg.append("g")
        .attr("class", "slider")
        .call(brush);

        slider.selectAll(".extent,.resize")
        .remove();

        slider.select(".background")
        .attr("height", slider_height);

        var handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate(0," + slider_height / 2 + ")")
        .attr("r", 9);

        slider
        .call(brush.event)
        .call(brush.extent([dispDate, dispDate]))
        .call(brush.event);

        var date_label = svg
        .append("g")
        .append("text")
        .classed("date-label", true)
        .classed("map-label", true)
        .attr("text-anchor", "start")
        .attr("x", width - 125)
        .attr("y", 210)
        .text(niceDate(dispDate));

        var legend = svg
        .append("g");

        labels = ["Unratified", "State", "Unorganized", "Territory",
          "Seceded", "Reconstruction", "Other"];

          for(i = 0; i < labels.length; i++) {

            legend
            .append("circle")
            .classed("unit", true)
            .classed("active", true)
            .classed(labels[i], true)
            .attr("cx", width - 115)
            .attr("cy", 240 + i * 30)
            .attr("r", 10);

            legend
            .append("text")
            .classed("map-label", true)
            .attr("x", width - 100)
            .attr("y", 246 + i * 30)
            .attr("text-anchor", "start")
            .text(labels[i]);

          }

          function brushed() {
            var value = brush.extent()[0];

            if (d3.event.sourceEvent) { // not a programmatic event
              value = x.invert(d3.mouse(this)[0]);
              brush.extent([value, value]);
            }

            handle.attr("cx", x(value));

            svg.selectAll(".date-label").text(niceDate(value));

            svg
            .selectAll(".unit")
            .data(states.features)
            .classed("active", function(d) {
              return dateParser(d.properties.START_DATE) <= value &&
                value <= dateParser(d.properties.END_DATE);
            })
            .classed("Seceded", function(d) {
              return Date.parse(d.properties.secession_start) <= value &&
                value <= Date.parse(d.properties.reconstruction_start);
            })
            .classed("Reconstruction", function(d) {
              return Date.parse(d.properties.reconstruction_start) <= value &&
                value < Date.parse(d.properties.reconstruction_end);
            })
            .classed("Unratified", function(d) {
              return value < Date.parse(d.properties.ratified);
            })
            .on("mousemove", function(d, i) {
              var mouse = d3.mouse(d3.select("body").node());

              tooltip
              .classed("hidden", false)
              .attr("style", "left:" + (mouse[0] + 20) +"px; top:" + (mouse[1] - 100) + "px")
              .html("<h4>" + d.properties.FULL_NAME + "</h4><p>" +
                  ratified(d) + 
                  seceded(d) +
                  reconstruction(d) +
                  "<strong>Boundary begin:</strong> " + niceDate(d.properties.START_DATE) + "<br>" +
                  "<strong>Boundary end:</strong> " + niceDate(d.properties.END_DATE) + "<br>" +
                  "<strong>Explanation of boundary change:</strong> " + d.properties.CHANGE + "</p>"
                   ); 
            })
            .on("mouseout", function(d, i) {
              tooltip.classed("hidden", true);
            });

          }
}  

function niceDate(date) {
  var dateOptions = {year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"};
    return new Date(date).toLocaleDateString("en-US", dateOptions);
}

function ratified(d) {
  if (d.properties.ratified) {
  return "<strong>Ratified Constitution:</strong> " + d.properties.ratified + "<br>";
  } else {return "";}
}

function seceded(d) {
  if (d.properties.secession_start) {
  return "<strong>Seceded:</strong> " + d.properties.secession_start + "<br>";
  } else {return "";}
}

function reconstruction(d) {
  if (d.properties.reconstruction_end) {
  return "<strong>Re-admitted to Congress:</strong> " + d.properties.reconstruction_end + "<br>";
  } else {return "";}
}

function dateParser(string) {
  if (string) { return new Date(string.substring(0, 10)); }
}

function clicked(d) {
  if (currentUnit.node() === this) return reset();
  currentUnit.classed("current", false);
  currentUnit = d3.select(this).classed("current", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.min(0.75 / Math.max(dx / width, dy / height), maxZoom),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  currentUnit.classed("current", false);
  currentUnit = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  var scale = Math.min(5, d3.event.scale);
  svg.selectAll(".unit").style("stroke-width", 1.0 / d3.event.scale + "px");
  svg.selectAll(".coast").style("stroke-width", 0.9 / d3.event.scale + "px");
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
