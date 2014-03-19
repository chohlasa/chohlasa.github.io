// Local variables
// Establish canvas parameters
var ts_margin = {top: 40, right:60, bottom:10, left:65}
, ts_w = 490 - ts_margin.right - ts_margin.left
, ts_h = 260 - ts_margin.top - ts_margin.bottom;

d3.select('#mg_timeseries_title').attr({'y': 25, 'x': ts_margin.left-50});
ts_chart = d3.select('#mg_timeseries_chart').attr({'transform': 'translate (' + ts_margin.left + ',' + ts_margin.top + ')'});

d3.json('RPA_Region_net_migration_v3.json', function(data) {

    var firstYear = new Date(d3.min(data.years).toString())
       , lastYear = new Date(d3.max(data.years).toString());

    var mergedArr = []
	, combined_data = [];
    for (index in data.data) {
	combined_data.push(data.data[index]);
	data.data[index].data.forEach(function(value) {mergedArr.push(value)});
    };   

    var highestValue = d3.max(mergedArr)
	, lowestValue = d3.min(mergedArr);

    ts_x_scale = d3.time.scale();
    ts_x_scale.domain([firstYear, lastYear])
	    .range([0, ts_w]);

    ts_y_scale = d3.scale.linear();
    ts_y_scale.domain([lowestValue, highestValue])
	    .range([ts_h, 0]);
    
    ts_x_axis = d3.svg.axis().scale(ts_x_scale).ticks(12);
    ts_y_axis = d3.svg.axis().scale(ts_y_scale).orient('left');

    var line = d3.svg.line()
	.x(function(d,i) { return ts_x_scale(new Date(data.years[i].toString())); })
	.y(function(d) { return ts_y_scale(d); });

    ts_chart.selectAll('path')
	.data(combined_data)
	.enter()
	.append('path')
	    .attr({'class': function(d) { return 'mg_timeseries_chartline ' + d.name; },
		  'd': function(d) {return line(d.data)} });

    ts_chart.selectAll('text')
	.data(combined_data)
	.enter()
	.append('text')
	    .text(function(d) {return d.name})
	    .attr({'class': function(d) { return 'mg_timeseries_chartline ' + d.name; },
		  'y': function(d) { return ts_y_scale(d.data[d.data.length -1]); },
		  'x': (ts_w + 5) });

    ts_chart.append('g').call(ts_x_axis).attr('transform', 'translate (0,' + ts_y_scale(0) + ')');
    ts_chart.append('g').call(ts_y_axis);

});
