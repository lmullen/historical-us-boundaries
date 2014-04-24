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

function ready(error, us) { 
  console.log(us);
  svg.append("path")
    .datum(topojson.feature(us, us.objects.states))
    .attr("d", d3.geo.path().projection(d3.geo.mercator()));
}  

