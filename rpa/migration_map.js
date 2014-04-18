// Local variables
// Establish canvas parameters
var margin = {top: 45, right:20, bottom:0, left:400}
, w = svg_width - margin.right - margin.left
, h = svg_height - margin.top - margin.bottom
, bar_chart_width = 380 - column_offset

// Set location of county description and legend
var county_x = w-290
, county_y = h-145
, legend_width = svg_width - margin.left - county_x - margin.right;

// Initialize projection, path, colors, and scales
var projection = d3.geo.conicConformal()
		     .rotate([74,0])
		     .scale(1)
		     .translate([0,0])
, path = d3.geo.path()
	   .projection(projection)
, color = d3.scale.linear().range(["#4FB3CF", "white", "#FDB924"])
, legend_scale = d3.scale.linear().range([0,legend_width])
, bar_scale = d3.scale.linear().range([0,bar_chart_width])
, bar_order = d3.scale.ordinal()
, scale_axis = d3.svg.axis().orient('bottom').ticks(5);

// Transform base elements
var svg = d3.select('#mg_svg') // Enclosing svg
	      .attr({ 'width': w + margin.left + margin.right,
		      'height': h + margin.top + margin.bottom }),
g = d3.select('#mg_map_g').attr('transform','translate (' + margin.left + ',' + margin.top + ')') // Map g
g_top = d3.select('#mg_top_g')	// g for elements above map
	    .attr("transform",'translate (' + margin.left + ',' + margin.top + ')'), 
bar_g = d3.select('#mg_bar_g')
	    .attr("transform", 'translate (' + barchart_panel + ', ' + (margin.top + 10) + ')'),
county_g = d3.select('#mg_county_g') 	// g for the timeseries				
		   .attr("transform",'translate (' + (margin.left + county_x) + ',' + (margin.top + county_y) + ')'),
scale_g = d3.select('#mg_scale_g')
		   .attr("transform", 'translate (' + (margin.left + county_x) + ',' + (margin.top + county_y + line_height*4.5) + ')');
d3.select('#mg_scale_axis').attr("transform", 'translate (0,16)');

////  Set size of background reset rectangle
d3.select('#mg_bknd').attr({ 'width': w + margin.left + margin.right,
			     'height': h + margin.top + margin.bottom });

////  Set default county name text
d3.select('#mg_county_name')
  .text(region_names[0])

////  Shift text down below county name down
d3.select('#mg_county_desc').attr('y', line_height);
d3.select('#mg_county_year').attr('y', line_height*2);
d3.select('#mg_county_data').attr('y', line_height*3);

////  Move type & category select elements	
var select_title_offset = margin.left + 180
    , selects_box_offsets = {year: select_title_offset+ 115, 
			     type: select_title_offset+215, 
			     category: select_title_offset+215/*305*/};
d3.select('#mg_select_title').attr({'x': select_title_offset + 'px', 
				    'y': (line_placement + 15) + 'px'});
d3.select('.year.mg_dropdown').style({'left': selects_box_offsets.year + 'px', 
				      'top': line_placement + 2 + 'px'});
d3.select('.type.mg_dropdown').style({'left': selects_box_offsets.type + 'px', 
				      'top': line_placement + 2 + 'px'});
d3.select('.category.mg_dropdown').style({'left': selects_box_offsets.category + 'px', 
					  'top': line_placement + 2 + 'px'});

//// Move bar chart title
d3.select('#mg_bar_header').attr({'x': (barchart_panel) + 'px', 'y': (line_placement + 15) + 'px'});




// DATA CHART MAP ////////////////////////////////////////////////////////////////////////

// Open migration datafile
d3.json('Migration_RawCategories_RPA-Counties_WiscNetMigration.json', function(data) {
  
  // Open shapefile
  d3.json('rpa-counties-v3s.json', function(json) {
    
    // Shortcut to features
    var features = json.features;
    var current_year = "2000"
    
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
      'id': function(d) {return 'mg_geoarea' + d.properties.FIPS},
      'd': path,
      'fill': 'white'
    });
    
    // Initialize bar chart
    var fips_list = [];
    data[current_year].forEach(function(value,index,array) {fips_list.push(value.fips)});
    bar_order.domain(fips_list);
    bar_order.rangeBands([0,h-margin.top-margin.bottom+25],0.5,0);
    d3.select('#mg_bar_chart').attr('transform', 'translate (' + column_offset + ',0)')
    var bars = d3.select('#mg_bar_rects')
		 .selectAll('rect')
		 .data(data[current_year])
		 .enter()
		 .append('rect')
		 .attr({
      'class': function(d) {return 'mg_bar'},
      'id': function(d) {return 'mg_bar' + d.fips},
      'width': '20px',
      'height': '10px',
      'y': function(d) {return bar_order(d.fips)},
      'fill': 'white'
    });
    var bar_numbers = d3.select('#mg_bar_numbers')
			.selectAll('text')
		 .data(data[current_year])
		 .enter()
		 .append('text')
		 .attr({
      'class': 'mg_bar mg_bar_number',
      'id': function(d) {return 'mg_bar_number' + d.fips},
      'y': function(d) {return bar_order(d.fips); },
      'x': 0
    });
    var bar_labels = d3.select('#mg_bar_labels')
		       .selectAll('text')
		       .data(data[current_year])
		       .enter()
		       .append('text')
		       .text(function(d) {return d.name + ', ' + d.stname})
								  .attr({										
									 'class': 'mg_bar',
									 'id': function(d) {return  'mg_bar_label' + d.fips},
									 'y': function(d) {return bar_order(d.fips) + 8} ,
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
      county_selected_FIPS = d.properties.FIPS;

      outlineCounty(d.properties.FIPS);
      outlineBar(d.properties.FIPS);
      countyName(d.properties.COUNTY + ', ' + d.properties.STATE);
      countyDataUpdate(d.properties.value, current_type)
      markSelected(d.properties.FIPS);
    });
    // Set up chart interaction
    bar_g.selectAll(".mg_bar")
	 .on('mouseover', function(d){
      county_selected = true;
      county_selected_FIPS = d.FIPS;

      outlineCounty(d.FIPS);
      outlineBar(d.FIPS);
      countyName(d.name);
      countyDataUpdate(d.value, current_type)
      markSelected(d.FIPS);
    });

    // Add mg_link_data interaction
    d3.selectAll('.mg_link')
	.on('click', function() {
	    values = d3.select(this).attr('class').split(' ')[1].split('_');
	    var category = values[0]
		, type = values[1]
		, level = [values[2],values[3]];
	    mg_reset();
	    county_selected = false;
	    updateMig(category, type, level);

	    county = d3.select(this).attr('class').split(' ')[2];

	    if (county=='all') {
		mg_reset();
		county_selected = false;
	    } else {
		FIPS = county_to_FIPS(county);

		var d = d3.select('#mg_geoarea' + FIPS).data()[0]
		county_selected = true;
		county_selected_FIPS = d.properties.FIPS;

		outlineCounty(FIPS);
		outlineBar(FIPS);
		countyName(d.properties.COUNTY + ', ' + d.properties.STATE);
		countyDataUpdate(d.properties.value, current_type)
		markSelected(FIPS);
	    }
	}); 

    // Add mg_link_data interaction
    d3.selectAll('.mg_link_data')
	.on('click', function() {
	    values = d3.select(this).attr('class').split(' ')[1].split('_');
	    var category = values[0]
		, type = values[1]
		, level = [values[2],values[3]];
	    mg_reset();
	    county_selected = false;
	    updateMig(category, type, level);
	});
    // Add mg_link_county interaction
    d3.selectAll('.mg_link_county')
	.on('click', function() {
	    county = d3.select(this).attr('class').split(' ')[1];
	    FIPS = county_to_FIPS(county);

	    var d = d3.select('#mg_geoarea' + FIPS).data()[0]
	    county_selected = true;
	    county_selected_FIPS = d.properties.FIPS;

	    outlineCounty(FIPS);
	    outlineBar(FIPS);
	    countyName(d.properties.COUNTY + ', ' + d.properties.STATE);
	    countyDataUpdate(d.properties.value, current_type)
	    markSelected(FIPS);
	    
	});    

    // Interaction with dropdowns
    d3.selectAll('.mg_dropdown')
      .on('change', function() {
      
	  var dropdown_kind = d3.select(this).attr('class').split(' ')[0];
      
	  // Establish category, type
	  if (dropdown_kind == 'type') {
	      current_type = d3.select(this)[0][0].value;
	  } else if (dropdown_kind == 'category') {
	      current_category = d3.select(this)[0][0].value.split('_')[0];
	      current_level = d3.select(this)[0][0].value.split('_')[1].split('-');
	  } else if (dropdown_kind == 'year') {
	      current_year = d3.select(this)[0][0].value.split('-')[0];
	  };
	  
	  updateMig(current_category,current_type,current_level);
      
    });

    //// POPULATE DROPDOWNS
    // Populate year dropdown 
    years = ["2000-2010", "1990-2000"]
    for (ix in years) {
      d3.select(".year.mg_dropdown").insert('option').text(years[ix]).attr('value', years[ix])
    };
    
    // Populate type dropdown			
    for (type in data[current_year][0].data) {
      var type_text = '';
      var draw = false;
      if (type=='migrants') {
	type_text = 'Net count';
	draw = true;
      } else if (type=='rates') {
	type_text = 'Net rate';
	draw = true;
      }				
      if (draw) {
	d3.select('.type.mg_dropdown').insert('option',':first-child') //This ensures that rate comes first
			.text(type_text)
		 .attr({
	  'value': type,
	})					
      }
    };
    // Populate category dropdown
    line_placement = 25;
    var extraCategories = [['All categories','total','0-79'], ['Under 20', 'total', '0-19'], ['Ages 20-34', 'total','20-34'], ['Ages 35-49', 'total', '35-49'],
			   ['Ages 50-64', 'total', '50-64'], ['Ages 65+','total','65-79']]
    function addCategory(type,text,category,level) {
      d3.select('.category.mg_dropdown').append('option')
			  .text(text.toProperCase())
				    .attr({
	'value': category + '_' + level,
      });
    }
    for (item in extraCategories) {
      addCategory(type, extraCategories[item][0], extraCategories[item][1], extraCategories[item][2]);
    };
    for (category in data[current_year][0].data[type]) {
      if (category != 'total') {addCategory(type, category, category, '0-79');}
    };


    // Initialize "current" variables
    var current_category = '',
    current_type = '',
    current_level = ['',''];




    function updateMig(category,type,level) {


      if (current_level[0] != level[0]) {
	  $('.category.mg_dropdown').val(category + "_" + level[0] + '-' + level[1]);
      }
      if (current_category != category) {
	  $('.category.mg_dropdown').val(category + "_" + level[0] + '-' + level[1]);
      }
      if (current_type != type) {
	  $('.type.mg_dropdown').val(type);
      }

      current_category = category;
      current_type = type;
      current_level = level;
      var age_range = level[0] + '-' + level[1];

      // Establish fixed bounds for color scale
	if (current_type == 'rates') {
	    var data_min = -30
	    , data_max = 100;
	} else if (current_type == 'migrants') {
	    var data_min = -200000
	    , data_max = 225000;
      	}

      // Draw scale
      color.domain([data_min, 0, data_max]);
      bar_scale.domain([data_min,data_max]);
      legend_scale.domain([data_min, data_max]);

      scale_axis.scale(legend_scale);
      d3.select('#mg_scale_axis').call(scale_axis);

      d3.select("#scale_neg_rect").attr({
	  'x': legend_scale(data_min),
	  'width': legend_scale(0)
      });
      d3.select("#scale_pos_rect").attr({
	  'x': legend_scale(0),
	  'width': (legend_scale(data_max)-legend_scale(0))
      });

      updateHeaders(current_type, current_category, current_level, current_year)
      
      // CALCULATE DATA FROM SELECTION
      var this_data = data_summer(data[current_year],type,category,level);      
      
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
					 .text(function(d) {return toCommas(d.value)})
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

      // Match calculated values with corresponding GeoJSON objects
      for (var i=0; i<features.length; i++) {
	var geo_line = features[i].properties;
	for (var j=0; j<this_data.length; j++) {
	  if (this_data[j].FIPS == geo_line.FIPS) {
	    geo_line.value = this_data[j].value;
	    geo_line.value_category = category;
	    geo_line.value_type = type;
	    
	    break;
	  }
	}
      } 
      
      // Update county data, if a county is selected
      if (county_selected) {
	  countyDataUpdate(this_data.filter(function(value) {return value.FIPS == county_selected_FIPS})[0].value, current_type)
      }

      // Map data as choropleth!
      map.data(features)
	 .transition()
	 .duration(transition_time)
	 .attr('fill', function(d) {return color(d.properties.value);});
    }
      
    // Default selection (run this when opening page)
    updateMig('total','migrants',['20','34']);
    
  })		
  
})
