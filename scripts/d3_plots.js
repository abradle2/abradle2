$(document).ready(function() {
	pie_chart({
		divID: "piechart-div",
		data: [
			["Male", 20], ["Female", 75], ["Other", 5]
		]
	});
	line_chart({
		divID: "line1-div",
		series: [{
			name: "line",
			symbol: "circle",
			symbolColor: "#9AFA66",
			symbolSize: 128, 		//in d3 units
			symbolBorderWidth: 3, 	//in px
			symbolBorderColor: "#5AFF00",
			lineColor: "#222222",
			lineWidth: 3, 			//in px
			interpolation: "none",
			data: [
				[-1,10], [0,5], [1,0], [2,5], [3,10]
			]
		}]
	});
	bar_chart({
		div: "#barchart-div",
		categories: ["A", "B", "C", "D", "E", "F", "G", "Pizza"],
		data: [32, 43, 9, 30, 22, 13, 7, 65]
	});

	//Make up some fake data for the scatter plot:
	var scatterData = [];
	var generator = d3.random.normal(50, 10)
	for (var i=0; i<100; i++) {
		var x = generator();
		var y = generator();
		var datapoint = [parseInt(x), parseInt(y)];
		scatterData.push(datapoint);
	}

	scatter_plot({
		divID : "scatterplot-div",
		series: [{
			name: "Pizza",
			symbol: "circle",
			color: "#9AFA66",
			size: 64, 			//in d3 units
			borderWidth: 2, 	//in px
			borderColor: "#5AFF00",
			data: scatterData
		}]

	});
});

function bar_chart(params) {
	var w = $(params.div).width()
	var h = $(params.div).height()
	var padding = {left : 80, 
			      right : 20,
			      top : 50,
			      bottom : 80};
	var barPadding = 1;
	categories = params.categories;
	data = params.data;

	//create dataset from categories and data
	var dataset = [];
	for (var i=0; i<categories.length; i++) {
		var datapoint = [categories[i], data[i]];
		dataset.push(datapoint);
	};

	var xScale = d3.scale.ordinal()
    					 .domain(categories)
    					 .rangeRoundBands([0, w-padding.left-padding.right], 0.1);


	var yScale = d3.scale.linear()
						 .domain([0,
						 		  d3.max(dataset, function(d) {return d[1];})])
						 .range([h-padding.top-padding.bottom, 0]);

	//define axes
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
					  .ticks(5)
					  .outerTickSize(0);
	var yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(5);

	//Rescale the axes to the next major tick mark to make the plot look nice
	var yTicks = yAxis.scale().ticks(yAxis.ticks()[0]);
	var yTickMax = yTicks[yTicks.length - 1] - yTicks[yTicks.length - 2] + yTicks[yTicks.length - 1];
	yScale.domain([0, yTickMax]);
	yAxis.scale = yScale;

	var svg = d3.select(params.div)
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	//add grid lines
	svg.selectAll("line.horizontalGrid").data(yScale.ticks()).enter()
       .append("line")
       .attr(
       {
            "class":"horizontalGrid",
            "x1" : padding.left,
            "x2" : w - padding.right,
            "y1" : function(d){ return padding.top+yScale(d);},
            "y2" : function(d){ return padding.top+yScale(d);},
            "class" : "grid-lines"
       });

	svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d) {return padding.left+xScale(d[0]); })
		.attr("y", function(d) {return padding.top + yScale(d[1]);})
		.attr("width", xScale.rangeBand())
		.attr("height", function(d) {return h-padding.top-padding.bottom-yScale(d[1]);})
		.attr("class", "bar-chart-rect");

	//add axes to plot
	svg.append("g")
		.attr("id", "x_axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")" )
		.call(xAxis);

	svg.append("g")
		.attr("id", "y_axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding.left + "," + (padding.top) + ")" )
		.call(yAxis);

	var topAxis = svg.append("svg:line")
					 .attr("x1", padding.left)
					 .attr("x2", w-padding.right)
					 .attr("y1", padding.top)
					 .attr("y2", padding.top)
					 .attr("class", "plot-border")
	var rightAxis = svg.append("svg:line")
					 .attr("x1", w-padding.right-1) 	//-1 is a shim
					 .attr("x2", w-padding.right-1)
					 .attr("y1", padding.top-1)
					 .attr("y2", h-padding.bottom+1)
					 .attr("class", "plot-border")

	//add axis labels
	svg.append("text")
	   .attr("x", (padding.left + (w - padding.left - padding.right)/2 ))
	   .attr("y", h - padding.bottom/3)
	   .attr("class", "axis-label")
	   .text("X Axis");

	svg.append("text")
	   .attr("x", -(padding.top + (h - padding.top - padding.bottom)/2) )
	   .attr("y", padding.left/3 )
	   .attr("class", "axis-label")
	   .attr("id", "y-axis-label")
	   .text("Y Axis");

	//add title
	svg.append("text")
	   .attr("x", (padding.left + (w - padding.left - padding.right)/2 ))
	   .attr("y", padding.top * 2/3)
	   .attr("id", "title")
	   .text("Simple Bar Chart");
}


function scatter_plot(params) {
	var w = $("#" + params.divID).width()
	var h = $("#" + params.divID).height()
	var padding = {left : 80, 
			      right : 20,
			      top : 50,
			      bottom : 80};
	var dataset = params.series[0].data;

	var xScale = d3.scale.linear()
						 .domain([d3.min(dataset, function(d) {return d[0];}), 
						 		  d3.max(dataset, function(d) {return d[0];})])
						 .range([padding.left, w - padding.right]);
	var yScale = d3.scale.linear()
						 .domain([d3.min(dataset, function(d) {return d[1];}),
						 		  d3.max(dataset, function(d) {return d[1];})])
						 .range([h - padding.bottom, padding.top]);

	//define svg element to put plot in
	d3.select(params.div).select("svg").remove();
	var svg = d3.select("#" + params.divID)
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	//define axes
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
					  .ticks(5);
	var yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(5);

	//Rescale the axes to the next major tick mark to make the plot look nice
	var yTicks = yAxis.scale().ticks(yAxis.ticks()[0]);
	var yTickMin = yTicks[0] - (yTicks[yTicks.length - 1] - yTicks[yTicks.length - 2]);
	var yTickMax = yTicks[yTicks.length - 1] - yTicks[yTicks.length - 2] + yTicks[yTicks.length - 1];
	yScale.domain([yTickMin, yTickMax]);
	yAxis.scale = yScale;

	var xTicks = xAxis.scale().ticks(xAxis.ticks()[0]);
	var xTickMin = xTicks[0] - (xTicks[xTicks.length - 1] - xTicks[xTicks.length - 2]);
	var xTickMax = xTicks[xTicks.length - 1] - xTicks[xTicks.length - 2] + xTicks[xTicks.length - 1];
	xScale.domain([xTickMin, xTickMax]);
	xAxis.scale = xScale;

	//add grid lines
	svg.selectAll("line.horizontalGrid").data(yScale.ticks(5)).enter()
       .append("line")
       .attr(
       {
            "class":"horizontalGrid",
            "x1" : padding.left,
            "x2" : w - padding.right,
            "y1" : function(d){ return yScale(d);},
            "y2" : function(d){ return yScale(d);},
            "class" : "grid-lines"
       });

    svg.selectAll("line.verticalGrid").data(xScale.ticks(5)).enter()
       .append("line")
       .attr(
       {
            "class":"horizontalGrid",
            "x1" : function(d){ return xScale(d);},
            "x2" : function(d){ return xScale(d);},
            "y1" : padding.top,
            "y2" : h - padding.bottom,
            "class" : "grid-lines"
       });

	//add axes to plot
	svg.append("g")
		.attr("id", "x_axis")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding.bottom) + ")" )
		.call(xAxis);

	svg.append("g")
		.attr("id", "y_axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding.left + "," + (0) + ")" )
		.call(yAxis);

	var topAxis = svg.append("svg:line")
					 .attr("x1", padding.left)
					 .attr("x2", w-padding.right)
					 .attr("y1", padding.top)
					 .attr("y2", padding.top)
					 .attr("class", "plot-border")
	var rightAxis = svg.append("svg:line")
					 .attr("x1", w-padding.right)
					 .attr("x2", w-padding.right)
					 .attr("y1", padding.top - 1) 	//-1 is a shim
					 .attr("y2", h-padding.bottom)
					 .attr("class", "plot-border")

	//draw symbols representing data and make them respond to mouse hover
	var symbol = (params.series[0].symbol === undefined) ? "circle" : params.series[0].symbol;
	var symbolColor = (params.series[0].color === undefined) ? "#0EB6C2" : params.series[0].color;
	var symbolSize = (params.series[0].size === undefined) ? 64 : parseInt(params.series[0].size);
	var symbolBorderWidth = (params.series[0].borderWidth === undefined) ? 0 : parseInt(params.series[0].borderWidth);
	var symbolBorderColor = (params.series[0].borderColor === undefined) ? "#000000" : params.series[0].borderColor;

	svg.selectAll(".point")
	   .data(dataset)
	   .enter()
	   .append("path")
	   .attr("class", "point")
	   .attr("d", d3.svg.symbol().type(symbol).size(symbolSize))
	   .attr("fill", symbolColor)
	   .attr("stroke-width", symbolBorderWidth + "px")
	   .attr("stroke", symbolBorderColor)
	   .attr("transform", function(d) {return "translate(" + xScale(d[0]) + "," + yScale(d[1]) + ")"});
   	   

	//add axis labels
	svg.append("text")
	   .attr("x", (padding["left"] + (w - padding.left - padding.right)/2 ))
	   .attr("y", h - padding.bottom/3)
	   .attr("class", "axis-label")
	   .text("X Axis");

	svg.append("text")
	   .attr("x", -(padding.top + (h - padding.top - padding.bottom)/2) )
	   .attr("y", padding.left/3 )
	   .attr("class", "axis-label")
	   .attr("id", "y-axis-label")
	   .text("Y Axis");

	//add title
	svg.append("text")
	   .attr("x", (padding.left + (w - padding.left - padding.right)/2 ))
	   .attr("y", padding.top * 2/3)
	   .attr("id", "title")
	   .text("Simple Scatter Plot");
};


function line_chart(params) {
	var w = $("#" + params.divID).width()
	var h = $("#" + params.divID).height()
	var padding = {left : 80, 
			      right : 20,
			      top : 50,
			      bottom : 80};
	var dataset = params.series[0].data;

	var xScale = d3.scale.linear()
						 .domain([d3.min(dataset, function(d) {return d[0];}), 
						 		  d3.max(dataset, function(d) {return d[0];})])
						 .range([padding.left, w - padding.right]);
	var yScale = d3.scale.linear()
						 .domain([d3.min(dataset, function(d) {return d[1];}),
						 		  d3.max(dataset, function(d) {return d[1];})])
						 .range([h - padding.bottom, padding.top]);

	//define svg element to put plot in
	d3.select(params.div).select("svg").remove();
	var svg = d3.select("#" + params.divID)
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	//define axes
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
					  .ticks(5);
	var yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(5);

	//Rescale the axes to the next major tick mark to make the plot look nice
	var yTicks = yAxis.scale().ticks(yAxis.ticks()[0]);
	var yTickMin = yTicks[0] - (yTicks[yTicks.length - 1] - yTicks[yTicks.length - 2]);
	var yTickMax = yTicks[yTicks.length - 1] - yTicks[yTicks.length - 2] + yTicks[yTicks.length - 1];
	yScale.domain([yTickMin, yTickMax]);
	yAxis.scale = yScale;

	var xTicks = xAxis.scale().ticks(xAxis.ticks()[0]);
	var xTickMin = xTicks[0] - (xTicks[xTicks.length - 1] - xTicks[xTicks.length - 2]);
	var xTickMax = xTicks[xTicks.length - 1] - xTicks[xTicks.length - 2] + xTicks[xTicks.length - 1];
	xScale.domain([xTickMin, xTickMax]);
	xAxis.scale = xScale;

	//add grid lines
	svg.selectAll("line.horizontalGrid").data(yScale.ticks(5)).enter()
       .append("line")
       .attr(
       {
            "class":"horizontalGrid",
            "x1" : padding.left,
            "x2" : w - padding.right,
            "y1" : function(d){ return yScale(d);},
            "y2" : function(d){ return yScale(d);},
            "class" : "grid-lines"
       });

    svg.selectAll("line.verticalGrid").data(xScale.ticks(5)).enter()
       .append("line")
       .attr(
       {
            "class":"horizontalGrid",
            "x1" : function(d){ return xScale(d);},
            "x2" : function(d){ return xScale(d);},
            "y1" : padding.top,
            "y2" : h - padding.bottom,
            "class" : "grid-lines"
       });

	//add axes to plot
	svg.append("g")
		.attr("id", "x_axis")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding.bottom) + ")" )
		.call(xAxis);

	svg.append("g")
		.attr("id", "y_axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding.left + "," + (0) + ")" )
		.call(yAxis);

	var topAxis = svg.append("svg:line")
					 .attr("x1", padding.left)
					 .attr("x2", w-padding.right)
					 .attr("y1", padding.top)
					 .attr("y2", padding.top)
					 .attr("class", "plot-border")
	var rightAxis = svg.append("svg:line")
					 .attr("x1", w-padding.right)
					 .attr("x2", w-padding.right)
					 .attr("y1", padding.top - 1) 	//-1 is a shim
					 .attr("y2", h-padding.bottom)
					 .attr("class", "plot-border")

	//draw symbols representing data and make them respond to mouse hover
	var symbol = (params.series[0].symbol === undefined) ? "circle" : params.series[0].symbol;
	var symbolColor = (params.series[0].symbolColor === undefined) ? "#0EB6C2" : params.series[0].symbolColor;
	var symbolSize = (params.series[0].symbolSize === undefined) ? 64 : parseInt(params.series[0].symbolSize);
	var symbolBorderWidth = (params.series[0].symbolBorderWidth === undefined) ? 0 : parseInt(params.series[0].symbolBorderWidth);
	var symbolBorderColor = (params.series[0].symbolBorderColor === undefined) ? "#000000" : params.series[0].symbolBorderColor;
	var lineColor = (params.series[0].lineColor === undefined) ? "#000000" : params.series[0].lineColor;
	var lineWidth = (params.series[0].lineWidth === undefined) ? "#000000" : params.series[0].lineWidth;
	var lineInterpolation = (params.series[0].interpolation === undefined) ? "#000000" : params.series[0].interpolation;

	//define the line for the plot
	var line = d3.svg.line()
				.interpolate(lineInterpolation)
   				.x(function(d) {return xScale(d[0]);})
   				.y(function(d) {return yScale(d[1])});

   	   	svg.append("svg:path")
   	   .attr("d", line(dataset))
   	   .attr("stroke", lineColor)
   	   .attr("stroke-width", lineWidth)
   	   .attr("fill", "none");

	svg.selectAll(".point")
	   .data(dataset)
	   .enter()
	   .append("path")
	   .attr("class", "point")
	   .attr("d", d3.svg.symbol().type(symbol).size(symbolSize))
	   .attr("fill", symbolColor)
	   .attr("stroke-width", symbolBorderWidth + "px")
	   .attr("stroke", symbolBorderColor)
	   .attr("transform", function(d) {return "translate(" + xScale(d[0]) + "," + yScale(d[1]) + ")"});

	//add axis labels
	svg.append("text")
	   .attr("x", (padding["left"] + (w - padding.left - padding.right)/2 ))
	   .attr("y", h - padding.bottom/3)
	   .attr("class", "axis-label")
	   .text("X Axis");

	svg.append("text")
	   .attr("x", -(padding.top + (h - padding.top - padding.bottom)/2) )
	   .attr("y", padding.left/3 )
	   .attr("class", "axis-label")
	   .attr("id", "y-axis-label")
	   .text("Y Axis");

	//add title
	svg.append("text")
	   .attr("x", (padding.left + (w - padding.left - padding.right)/2 ))
	   .attr("y", padding.top * 2/3)
	   .attr("id", "title")
	   .text("Simple Line Chart");
};

function pie_chart(params) {
	var w = $("#" + params.divID).width()
	var h = $("#" + params.divID).height()
	var radius = Math.min(w, h) / 2;
	
	var dataset = params.data;


	var color = d3.scale.ordinal()
		.range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	var arc = d3.svg.arc()
				.outerRadius(radius - 60)
				.innerRadius(0);

	var pie = d3.layout.pie()
				.sort(null)
				.value(function(d) {return d[1]; });

	//define svg element to put plot in
	d3.select(params.div).select("svg").remove();
	var svg = d3.select("#" + params.divID)
				.append("svg")
				.attr("width", w)
				.attr("height", h);

	var g = svg.selectAll(".arc")
			   .data(pie(dataset))
			   .enter()
			   .append("g")
			   .attr("class", "arc")
			   .attr("transform", "translate(" + w/2 + "," + h/2 + ")")
	
	g.append("path")
   		.attr("d", arc)
		.style("fill", function(d) {return color(d.data[0])});

	g.append("text")
		.attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
		.attr("dy", "0.35em")
		.style("text-anchor", "middle")
		.text(function(d) {return d.data[0]});

	//add title
	svg.append("text")
	   .attr("x", w/2 )
	   .attr("y", h*1/8)
	   .attr("id", "title")
	   .text("Simple Pie Chart");
};


