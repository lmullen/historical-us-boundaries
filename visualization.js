queue()
  .defer(d3.json, "us.json")
  .await(ready);

var margin = {top: 10, right: 10, bottom: 10, left: 10};
var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var svg = d3.select("#viz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dispDate = new Date(1861,6,04);

d3.select("#date").html("<strong>" + niceDate(dispDate) + "</strong>");

function ready(error, us) { 
  console.log(us);
  console.log(us.objects.states.geometries[0]); 

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

  var states = topojson.feature(us, us.objects.states);

  var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
  
  svg
    .selectAll(".states")
    .data(states.features)
    .enter()
    .append("path")
    .attr("title", function(d,i) { return d.properties.TERR_TYPE; })
    .attr("class", function(d) { 
      return "unit " + d.id + " " + d.properties.TERR_TYPE; 
    })
    .attr("d", path)
    .filter(function(d) {
      console.log(new Date(d.properties.START_DATE).toString());
      return Date.parse(d.properties.START_DATE) <= dispDate &&
             dispDate <= Date.parse(d.properties.END_DATE);
    })
    .classed("active", true)
    .on("mousemove", function(d, i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
      tooltip
        .classed("hidden", false)
        .attr("style", "left:" + (mouse[0]+30)+"px; top:" + mouse[1] + "px")
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

function niceDate(date) {
  var dateOptions = {year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC"};
  return new Date(date).toLocaleDateString("en-US", dateOptions);
}

