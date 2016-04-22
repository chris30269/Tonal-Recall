var allData;
var timeToTarget={};

//time to do each assignment

//time to hit each target

//variance in hitting each target

$(function(){
	$.post( "php/stats.php", function(data) {
		allData = JSON.parse(data);
		timeToTargets();
		whenJoined();
		assignmentsCompleted();
	});
});

function timeToTargets(){
	// for (var i = 0; i < allData.length; i++) {
	// 	//for each user
	// 	for (var j = 0; j < allData[i].data.length; j++) {
	// 		//for each user's data
	// 		if(!timeToTarget[i]) timeToTarget[i]=[];
	// 		//timeToTarget[j].push(allData[i].data[j]);
	// 		if(!timeToTarget[i][allData[i].data[j].assignment-1]) timeToTarget[i][allData[i].data[j].assignment-1] = [];
	// 		//timeToTarget[allData[i].data[j].assignment].push(allData[i].data[j].);
	// 		for (var k = 0; k < allData[i].data[j].attempts.length; k++) {
	// 			//for each user's notes in each assignment
	// 			if(!timeToTarget[i][allData[i].data[j].assignment-1][k]) timeToTarget[i][allData[i].data[j].assignment-1][k] = [];
	// 			// timeToTarget[i][j][k].push(allData[i].data[j].attempts[k]);
	// 		};
	// 	};
	// };
	var count = 0;
	for (var i = 0; i < allData.length; i++) {
		if(allData[i].data != "" && allData[i] != "new" && allData[i].userId > 24){
			count++;
		}
		var string = "<tr><td>"+allData[i].userId+"</td>";
		var date = new Date(1000*allData[i].consent);
		string += "<td>"+date.toString()+"</td>";
		for (var j = 0; j < allData[i].data.length; j++) {
			string += "<td>"+allData[i].data[j].assignment+"</td>";
		};
		string += "</tr>";
		$("#table").append(string);
	};

	$("#totalUsers").html(allData.length);
	$("#activeUsers").html(count);
}

function whenJoined(){
	var joined = {};
	for (var i = 0; i < allData.length; i++) {
		var date = new Date(1000*allData[i].consent);
		var month = date.getMonth()+1;
		var day = date.getDate();
		var year = date.getFullYear();
		var datestring = ""+month+" "+day+" "+year;
		if(joined[datestring]) joined[datestring] = joined[datestring]+1;
		else joined[datestring] = 1;
	};
	var joinedArr = [];
	for (var i = 0; i < Object.keys(joined).length; i++) {
		var date = Object.keys(joined)[i];
		var num = joined[date];
		var temp = {"date":date, "num":num};
		joinedArr.push(temp);
	};
	// console.log(JSON.stringify(joinedArr));

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10, "");

	var svg = d3.select("#whenJoined").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var data = joinedArr;
	x.domain(data.map(function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.num; })]);

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	  .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("New users");

	svg.selectAll(".bar")
	    .data(data)
	  .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.date); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.num); })
	    .attr("height", function(d) { return height - y(d.num); });

	function type(d) {
	  d.num = +d.num;
	  return d;
	}
}

function assignmentsCompleted(){
	var completed = [];
	for (var i = 0; i < assignments.length; i++) {
		var temp = {"assignment":assignments[i].id, "count":0};
		completed.push(temp);
	};
	for (var i = 0; i < allData.length; i++) {
		for (var j = 0; j < allData[i].data.length; j++) {
			completed[allData[i].data[j].assignment-1].count++;
		};
	};
	//console.log(JSON.stringify(completed));

	//
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = (window.innerWidth) - margin.left - margin.right,
	    height = (window.innerHeight) - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10, "");

	var svg = d3.select("#assignmentsCompleted").append("svg")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr('viewBox','0 0 '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom))+' '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom)))
	    .attr('preserveAspectRatio','xMinYMin')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var data = completed;
	x.domain(data.map(function(d) { return d.assignment; }));
	y.domain([0, d3.max(data, function(d) { return d.count; })]);

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	  .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -24)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Completions");

	svg.selectAll(".bar")
	    .data(data)
	  .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.assignment); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.count); })
	    .attr("height", function(d) { return height - y(d.count); });

	function type(d) {
	  d.count = +d.count;
	  return d;
	}
}