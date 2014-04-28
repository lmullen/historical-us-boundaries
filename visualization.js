queue()
  .defer(d3.json, "us.json")
  .defer(d3.json, "coast.json")
  .await(ready);

var margin = {top: 10, right: 20, bottom: 10, left: 20};
var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var svg = d3.select("#viz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

slider_height = 20;

var slider_svg = d3.select("#slider").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", slider_height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dispDate = new Date(1783,8,3);

// d3.select("#date").html("<strong>" + niceDate(dispDate) + "</strong>");

function ready(error, us, coast) { 

  var tooltip = d3.select("#viz").append("div")
    .classed("hidden", true)
    .attr("class", "tooltip");

    console.log(coast);

  var states = topojson.feature(us, us.objects.states);
  var coastline  = topojson.feature(coast, coast.objects.coast);

  // var projection = d3.geo.mercator()
  var projection = d3.geo.albers()
    .scale(1100)
    .translate([ .5 * width, .5 * height]);

  var path = d3.geo.path()
    .projection(projection);
  
  svg
    .selectAll(".unit")
    .data(states.features)
    .enter()
    .append("path")
    .attr("title", function(d,i) { return d.properties.TERR_TYPE; })
    .attr("class", function(d) { 
      return "unit " + d.id + " " + d.properties.TERR_TYPE; 
    })
    .attr("d", path);
    // .filter(function(d) {
    //   return Date.parse(d.properties.START_DATE) <= dispDate &&
    //          dispDate <= Date.parse(d.properties.END_DATE);
    // })
    // .classed("active", true)
    // .on("mousemove", function(d, i) {
    //   var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
    //   tooltip
    //     .classed("hidden", false)
    //     .attr("style", "left:" + (mouse[0]+30)+"px; top:" + mouse[1] + "px")
    //     .html("<h4>" + d.properties.FULL_NAME + "</h4><p>" +
    //           "<strong>Type:</strong> " + d.properties.TERR_TYPE + "<br>" +
    //           "<strong>Boundary begin:</strong> " + niceDate(d.properties.START_DATE) + "<br>" +
    //           "<strong>Boundary end:</strong> " + niceDate(d.properties.END_DATE) + "<br>" +
    //           "<strong>Explanation of boundary change:</strong> " + d.properties.CHANGE + "</p>"
    //          ); 
    // })
    // .on("mouseout", function(d, i) {
    //   tooltip.classed("hidden", true);
    // });

  svg
    .selectAll(".coastline")
    .data(coastline.features)
    .enter()
    .append("path")
    .attr("class", "coast")
    .attr("d", path);

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

  tooltip.classed("hidden", true);

  var date_label = svg
    .append("g")
    .append("text")
    .attr("class", "date-label")
    .attr("text-anchor", "end")
    .attr("x", width - 175)
    .attr("y", 40)
    .text(niceDate(dispDate));

    console.log(date_label);

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
    .classed("active", false)
    .filter(function(d) {
      return Date.parse(d.properties.START_DATE) <= value &&
             value <= Date.parse(d.properties.END_DATE);
    })
    .classed("active", true)
    .on("mousemove", function(d, i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      var offset = d3.select("#viz")[0][0].offsetLeft;
      tooltip
        .classed("hidden", false)
        .attr("style", "left:" + (mouse[0] + offset + 40)+"px; top:" + mouse[1] + "px")
        .html("<h4>" + d.properties.FULL_NAME + "</h4><p>" +
              "<strong>Type:</strong> " + d.properties.TERR_TYPE + "<br>" +
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

