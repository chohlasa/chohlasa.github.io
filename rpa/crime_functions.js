String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function toCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function category_phraser(category) {
    if (category == 'expected') {return ' residents'}
    else if (category == 'migrants') {return ' migrants'}
    else if (category == 'rates') {return ' migrants/1,000 people'}
}

function mapbounds(data, bounds) {
    var b = [[d3.min(data.features, function(d) {return path.bounds(d)[0][0]}),
	      d3.min(data.features, function(d) {return path.bounds(d)[0][1]})],
	     [d3.max(data.features, function(d) {return path.bounds(d)[1][0]}),
	      d3.max(data.features, function(d) {return path.bounds(d)[1][1]})]];
    var mapdims = [b[1][0]-b[0][0],
		   b[1][1]-b[0][1]];
    var output = (arguments.length == 1) ? mapdims : b;
    return output;
}

function mg_reset () {
    g_top.selectAll('path').remove();
    outlineBar();
    d3.select('#mg_county_name')
	.text(region_names[0]);	
    d3.select('#mg_county_data')
	.text('');
    county_selected = false;
};

function outlineCounty(fips) {
    g_top.selectAll('path').attr('opacity', 0).remove();					
    var d_path = d3.select('#mg_geoarea' + fips).attr('d');
    g_top.append('path')
	.attr({
	    'stroke': '#EE3124',
	    'stroke-width': '1.5px',
	    'd': d_path,
	    'fill': 'none',
	    'opacity': 1
	});
};

function outlineBar(fips) {
    d3.selectAll('.mg_bar')
	.style('fill', null);
    d3.selectAll('text.mg_bar')
	.style({'fill': null,
		'font-weight': null});
    if (typeof fips != 'undefined') {
	d3.select('#mg_bar' + fips)
	    .style('fill', 'red');
	d3.select('#mg_bar_label' + fips)
	    .style({'fill': 'red',
		    'font-weight': 900});
	d3.select('#mg_bar_number' + fips)
	    .style({'fill': 'red',
		    'font-weight': 900});
    }
};

function countyName(county_name) {
    // Change county_name information on right side
    d3.select('#mg_county_name')
	.text(county_name);
};

function countyDataUpdate(county_data) {
    suffix = "% change"

    d3.select('#mg_county_data')
	.text(toCommas(county_data) + suffix);

    county_selected = true;
}


function markSelected(fips) {
    // Note FIPS and selection state
    county_selected = true;
    county_selected_FIPS = fips;
};


function county_to_FIPS(county) {
    // Convert county name to FIPS code

    var FIPS = "";

    switch(county) {
	case "NewHaven":
	    FIPS="09009";
	    break;

	case "Fairfield":
	    FIPS="09001";
	    break;

	case "Litchfield":
	    FIPS="09005";
	    break;

	case "Ocean":
	    FIPS="34029";
	    break;

	case "Hunterdon":
	    FIPS="34019";
	    break;

	case "Monmouth":
	    FIPS="34025";
	    break;

	case "Somerset":
	    FIPS="34035";
	    break;

	case "Union":
	    FIPS="34039";
	    break;

	case "Sussex":
	    FIPS="34037";
	    break;

	case "Essex":
	    FIPS="34013";
	    break;

	case "Passaic":
	    FIPS="34031";
	    break;

	case "Morris":
	    FIPS="34027";
	    break;

	case "Middlesex":
	    FIPS="34023";
	    break;

	case "Warren":
	    FIPS="34041";
	    break;

	case "Mercer":
	    FIPS="34021";
	    break;

	case "Hudson":
	    FIPS="34017";
	    break;

	case "Bergen":
	    FIPS="34003";
	    break;

	case "Nassau":
	    FIPS="36059";
	    break;

	case "Westchester":
	    FIPS="36119";
	    break;

	case "Queens":
	    FIPS="36081";
	    break;

	case "Dutchess":
	    FIPS="36027";
	    break;

	case "Sullivan":
	    FIPS="36105";
	    break;

	case "Bronx":
	    FIPS="36005";
	    break;

	case "Richmond":
	    FIPS="36085";
	    break;

	case "NewYork":
	    FIPS="36061";
	    break;

	case "Putnam":
	    FIPS="36079";
	    break;

	case "Ulster":
	    FIPS="36111";
	    break;

	case "Orange":
	    FIPS="36071";
	    break;

	case "Kings":
	    FIPS="36047";
	    break;

	case "Suffolk":
	    FIPS="36103";
	    break;

	case "Rockland":
	    FIPS="36087";
	    break;
    }

    return FIPS;

}
