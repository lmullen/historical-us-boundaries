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

var dispDate = new Date("1849-01-01");

function ready(error, us) { 
  console.log(us);

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
    .attr("class", function(d) { 
      return "unit " + d.id + " " + d.properties.TERR_TYPE; 
    })
    .attr("d", path)
    .filter(function(d) {
      return Date.parse(d.properties.START_DATE) < dispDate &&
             dispDate < Date.parse(d.properties.END_DATE);
    })
    .classed("active", true);
}  

