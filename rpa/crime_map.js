// Local variables
// Establish canvas parameters
var margin = {top: 20, right:20, bottom:0, left:390}
, w = svg_width - margin.right - margin.left
, h = svg_height - margin.top - margin.bottom
, bar_chart_width = margin.left - column_offset - 50

// Set location of county description and legend
var county_x = w-290
, county_y = h-120
, legend_width = svg_width - margin.left - county_x - margin.right;

// Initialize projection, path, colors, and scales
var projection = d3.geo.conicConformal()
		     .rotate([74,0])
		     .scale(1)
		     .translate([0,0])
, path = d3.geo.path()
	   .projection(projection)
, color = d3.scale.linear().range(["#BBDCED", "#007EAD"])
, legend_scale = d3.scale.linear().range([0,legend_width])
, bar_scale = d3.scale.linear().range([0,bar_chart_width])
, bar_order = d3.scale.ordinal()
, pct_format = d3.format("%")
, scale_axis = d3.svg.axis().orient('bottom').ticks(5).tickFormat(pct_format);

// Transform base elements
var svg = d3.select('#mg_svg') // Enclosing svg
	      .attr({ 'width': w + margin.left + margin.right,
		      'height': h + margin.top + margin.bottom }),
g = d3.select('#mg_map_g').attr('transform','translate (' + margin.left + ',' + margin.top + ')') // Map g
g_top = d3.select('#mg_top_g')	// g for elements above map
	    .attr("transform",'translate (' + margin.left + ',' + margin.top + ')'), 
bar_g = d3.select('#mg_bar_g')
	    .attr("transform", 'translate (' + barchart_panel + ', ' + (margin.top + 30) + ')'),
county_g = d3.select('#mg_county_g') 	// g for the timeseries				
		   .attr("transform",'translate (' + (margin.left + county_x) + ',' + (margin.top + county_y) + ')'),
scale_g = d3.select('#mg_scale_g')
		   .attr("transform", 'translate (' + (margin.left + county_x) + ',' + (margin.top + county_y + line_height*3.5) + ')');
d3.select('#mg_scale_axis').attr("transform", 'translate (0,16)');

////  Set size of background reset rectangle
d3.select('#mg_bknd').attr({ 'width': w + margin.left + margin.right,
			     'height': h + margin.top + margin.bottom });

////  Set default county name text
d3.select('#mg_county_name')
  .text(region_names[0])

////  Shift text down below county name down
d3.select('#mg_county_desc').attr('y', line_height*1);
d3.select('#mg_county_year').attr('y', line_height*2);
d3.select('#mg_county_data').attr('y', line_height*3);

//// Move bar chart title
d3.select('#mg_bar_header').attr({'x': (barchart_panel) + 'px', 'y': (line_placement + 15) + 'px'});




// DATA CHART MAP ////////////////////////////////////////////////////////////////////////

// Open shapefile
d3.json('CrimeSmall.json', function(json) {
    
    // Shortcut to features
    var features = json.features;
    
    // Center map and scale map to fit in g-group
    var b = mapbounds(json, true),
	s = 1 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
	t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s)
	.translate(t);

    var map = g.selectAll('path')
	    .data(features)
	    .enter()
	    .append('path')
	    .attr({
		'class': function(d) {return 'mg_geoarea'},
		'id': function(d) {return 'mg_geoarea' + d.properties.CTFIPS},
		'd': path,
		'fill': 'white'
	    });
    
    // Initialize bar chart
    var fips_list = [];
    features.forEach(function(value,index,array) {fips_list.push(value.properties.CTFIPS)});
    bar_order.domain(fips_list);
    bar_order.rangeBands([0,h-margin.top-margin.bottom],0.5,0);
    d3.select('#mg_bar_chart').attr('transform', 'translate (' + column_offset + ',0)')
    var bars = d3.select('#mg_bar_rects')
	    .selectAll('rect')
	    .data(features)
	    .enter()
	    .append('rect')
	    .attr({
		'class': function(d) {return 'mg_bar'},
		'id': function(d) {return 'mg_bar' + d.properties.CTFIPS},
		'width': '20px',
		'height': '10px',
		'y': function(d) {return bar_order(d.properties.CTFIPS)},
		'fill': 'white'
	    });
    var bar_numbers = d3.select('#mg_bar_numbers')
	    .selectAll('text')
	    .data(features)
	    .enter()
	    .append('text')
	    .attr({
		'class': 'mg_bar mg_bar_number',
		'id': function(d) {return 'mg_bar_number' + d.properties.CTFIPS},
		'y': function(d) {return bar_order(d.properties.CTFIPS); },
		'x': 0
	    });
    var bar_labels = d3.select('#mg_bar_labels')
	    .selectAll('text')
	    .data(features)
	    .enter()
	    .append('text')
	    .text(function(d) {return d.properties.COUNTY + ', ' + d.properties.STPOSTAL})
	    .attr({										
		'class': 'mg_bar',
		'id': function(d) {return  'mg_bar_label' + d.properties.CTFIPS},
		'y': function(d) {return bar_order(d.properties.CTFIPS) + 8} ,
		'x': 0
	    });

    var county_selected = false
    , county_selected_FIPS = '';

    // Set up map interaction reset
    d3.select('#mg_bknd')
	.on('click', function(d) {
	    mg_reset();
	    county_selected = false;
	});
    // Set up map interaction
    d3.selectAll('.mg_geoarea')
	.on('click', function(d) {
	    county_selected = true;
	    county_selected_FIPS = d.properties.CTFIPS;

	    outlineCounty(d.properties.CTFIPS);
	    outlineBar(d.properties.CTFIPS);
	    countyName(d.properties.COUNTY + ', ' + d.properties.STATE);
	    countyDataUpdate(d.properties.CrimeChang)
	    markSelected(d.properties.CTFIPS);
	});
    // Set up chart interaction
    bar_g.selectAll(".mg_bar")
	.on('mouseover', function(d){
	    county_selected = true;
	    county_selected_FIPS = d.FIPS;

	    outlineCounty(d.FIPS);
	    outlineBar(d.FIPS);
	    countyName(d.name);
	    countyDataUpdate(d.value)
	    markSelected(d.FIPS);
	});   


    function updateMap() {

	// Establish fixed bounds for color scale
	var data_min = -.4
	    , data_max = .1;

	// Draw scale
	color.domain([data_min, data_max]);
	bar_scale.domain([data_min,data_max]);
	legend_scale.domain([data_min, data_max]);

	scale_axis.scale(legend_scale);
	d3.select('#mg_scale_axis').call(scale_axis);

	d3.select("#scale_rect").attr({
	    'x': legend_scale(data_min),
	    'width': (legend_scale(data_max)-legend_scale(data_min))
	});

	// CALCULATE DATA FROM SELECTION
	var this_data = [];
	features.forEach(function(value, index, array) {this_data.push({ value:value.properties.CrimeChang,FIPS:value.properties.CTFIPS,name:value.properties.COUNTY + ', ' + value.properties.STPOSTAL}); });
	
	// Update bars
	fips_list = []; // Make ordered list for sorting bars
	this_data_sorted = this_data.slice(0).sort(function(a,b) {return (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0);} );
	this_data_sorted.forEach(function(value,index,array) {fips_list.push(value.FIPS)});
	bar_order.domain(fips_list);
	
	bar_g.selectAll('rect') // Update bars
	    .data(this_data)
	    .transition()
	    .duration(transition_time)
	    .attr({
		y: function(d) {return bar_order(d.FIPS)},
		x: function(d) {return (d.value > 0) ? bar_scale(0) : bar_scale(d.value)},
		width: function(d) {return Math.abs(bar_scale(d.value)-bar_scale(0))},
		fill: function(d) {return color(d.value)}
	    })
	bar_numbers // Update numbers
	    .data(this_data)
	    .transition()
	    .duration(transition_time)
	    .text(function(d) {return pct_format(d.value)})
	    .attr({ 
		y: function(d) {return bar_order(d.FIPS) + 8},
		x: function(d) {return (d.value > 0) ? bar_scale(d.value) + 5 : bar_scale(d.value) - 5 },
		'text-anchor': function(d) {return (d.value > 0) ? "start" : "end"}
	    });
	bar_labels // Update labels
	    .data(this_data)
	    .transition()
	    .duration(transition_time)
	    .attr({
		y: function(d) {return bar_order(d.FIPS) + 8}
	    });
	
	// Update county data, if a county is selected
	if (county_selected) {
	    countyDataUpdate(this_data.filter(function(value) {return value.FIPS == county_selected_FIPS})[0].value, current_type)
	}

	// Map data as choropleth!
	map.data(features)
	    .transition()
	    .duration(transition_time)
	    .attr('fill', function(d) {return color(d.properties.CrimeChang);});
    }
    
    // Default selection (run this when opening page)
    updateMap();
    
})
