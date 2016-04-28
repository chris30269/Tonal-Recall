var allData;
var lastDevUser = 24;

//time to do each assignment

//time to hit each target

//variance in hitting each target

$(function(){
	$.post( "php/stats.php", function(data) {
		// console.log(data);
		allData = JSON.parse(data);
		people();
		whenJoined();
		assignmentsCompleted();
		timeToAssignment();
		timeToTarget();
		totalError();
	});
});

function people(){
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
		if(allData[i].userId > lastDevUser){
			var date = new Date(1000*allData[i].consent);
			var month = date.getMonth()+1;
			var day = date.getDate();
			var year = date.getFullYear();
			var datestring = ""+month+" "+day+" "+year;
			if(joined[datestring]) joined[datestring] = joined[datestring]+1;
			else joined[datestring] = 1;
		}
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
		if(allData[i].userId > lastDevUser){
			for (var j = 0; j < allData[i].data.length; j++) {
				completed[allData[i].data[j].assignment-1].count++;
			};
		}
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

function timeToTarget(){
	var assignmentTargets = [];
	for (var i = 0; i < assignments.length; i++) {
		var temp = {"assignment":assignments[i].id, "targets":[]};
		assignmentTargets.push(temp);
	};
	for (var i = 0; i < assignments.length; i++) {
		for (var j = 0; j < assignments[i].targets.length; j++) {
			assignmentTargets[i].targets.push([]);
		};
	};

	for (var i = 0; i < allData.length; i++) {
		if(allData[i].userId > lastDevUser){
			for (var j = 0; j < allData[i].data.length; j++) {
				//find the assignment (maybe more direct access via array)
				for (var k = 0; k < assignmentTargets.length; k++) {
					if(assignmentTargets[k].assignment == allData[i].data[j].assignment){
						//found the assignment
						//cross your fingers shit lines up right
						for (var l = 0; l < allData[i].data[j].attempts.length; l++) {
							// for (var m = 0; m < allData[i].data[j].attempts[l].length; m++) {
							// 	allData[i].data[j].attempts[l][m]
							// };
							var last = allData[i].data[j].attempts[l][allData[i].data[j].attempts[l].length-1].time;
							var first = allData[i].data[j].attempts[l][0].time;
							var dur = last-first;
							if(dur < 30){
								assignmentTargets[k].targets[l].push(dur);
							}
						};
					}
				};
			};
		}
	};
	for (var i = 0; i < assignmentTargets.length; i++) {
		for (var j = 0; j < assignmentTargets[i].targets.length; j++) {
			var total = 0;
			for (var k = 0; k < assignmentTargets[i].targets[j].length; k++) {
				total += assignmentTargets[i].targets[j][k];
			};
			assignmentTargets[i].targets[j] = total/assignmentTargets[i].targets[j].length;
		};
	};

	// console.log(assignmentTargets);

	var allTargets = [];
	var counter = 0;
	for (var i = 0; i < assignmentTargets.length; i++) {
		for (var j = 0; j < assignmentTargets[i].targets.length; j++) {
			if(assignmentTargets[i].targets[j] >-1){
				var temp = {"time":Math.round(1000*assignmentTargets[i].targets[j]), "which":counter+1, "assignment":assignmentTargets[i].assignment};
				allTargets.push(temp);
			}
			else{
				var temp = {"time":0, "which":counter+1, "assignment":assignmentTargets[i].assignment};
				allTargets.push(temp);
			}
			counter++;
		};
	};

	// console.log(JSON.stringify(allTargets));
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

	var svg = d3.select("#timeToTarget").append("svg")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr('viewBox','0 0 '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom))+' '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom)))
	    .attr('preserveAspectRatio','xMinYMin')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var data = allTargets;
	x.domain(data.map(function(d) { return d.which; }));
	y.domain([0, d3.max(data, function(d) { return d.time; })]);

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
	    .attr("fill", function(d){
	    	return "hsl("+((d.assignment-1)%12)*30+", 100%, 50%)";
	    })
	    .attr("x", function(d) { return x(d.which); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.time); })
	    .attr("height", function(d) { return height - y(d.time); });

	function type(d) {
	  d.time = +d.time;
	  return d;
	}
}

function timeToAssignment(){
	//seconds
	//this is not gonna be quite right because of the tour :(
	var assignmentTargets = [];
	for (var i = 0; i < assignments.length; i++) {
		var temp = {"assignment":assignments[i].id, "time":[], "sd":0};
		assignmentTargets.push(temp);
	};
	
	for (var i = 0; i < allData.length; i++) {
		if(allData[i].userId > lastDevUser){
			for (var j = 0; j < allData[i].data.length; j++) {
				//find the assignment (maybe more direct access via array)
				for (var k = 0; k < assignmentTargets.length; k++) {
					if(assignmentTargets[k].assignment == allData[i].data[j].assignment){
						//found the assignment
						//cross your fingers shit lines up right
						var time = allData[i].data[j].finished - allData[i].data[j].started;
						if(time < 1000){
							assignmentTargets[k].time.push(time);
						}
					}
				};
			};
		}
	};
	for (var i = 0; i < assignmentTargets.length; i++) {
		var total = 0;
		if(assignmentTargets[i].time.length == 0){
			assignmentTargets[i].time = 0;
			assignmentTargets[i].sd = 0;
		}
		else if(assignmentTargets[i].time.length == 1) assignmentTargets[i].sd = 0;
		else{
			for (var j = 0; j < assignmentTargets[i].time.length; j++) {
				total+=assignmentTargets[i].time[j];
			};
			// console.log(d3.deviation(assignmentTargets[i].time));
			assignmentTargets[i].sd = d3.deviation(assignmentTargets[i].time);
			assignmentTargets[i].time = total/assignmentTargets[i].time.length;
		}
	};


	console.log(JSON.stringify(assignmentTargets));
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

	var svg = d3.select("#timeToAssignment").append("svg")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr('viewBox','0 0 '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom))+' '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom)))
	    .attr('preserveAspectRatio','xMinYMin')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var data = assignmentTargets;
	x.domain(data.map(function(d) { return d.assignment; }));
	y.domain([0, d3.max(data, function(d) { return d.time; })]);

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
	    .text("Time to target");

	svg.selectAll(".bar")
	    .data(data)
	  .enter().append("rect")
	    .attr("class", "bar")
	    .attr("fill", function(d){
	    	return "hsl("+((d.assignment-1)%12)*30+", 100%, 50%)";
	    })
	    .attr("x", function(d) { return x(d.assignment); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.time); })
	    .attr("height", function(d) { return height - y(d.time); });

	svg.selectAll(".sdLines")
		.data(data).enter().append("line")
			.attr("x1", function(d) { return x(d.assignment)+Math.floor(x.rangeBand()/2); })
			.attr("y1", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.time-(d.sd/2));
			})
			.attr("x2", function(d) { return x(d.assignment)+Math.floor(x.rangeBand()/2); })
			.attr("y2", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.time+(d.sd/2));
			})
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("class","sdLines");;
}

function totalError(){
	var allTargets = [];
	var targetCounter = 0;
	//make a spot for each target
	for (var i = 0; i < assignments.length; i++) {
		for (var j = 0; j < assignments[i].targets.length; j++) {
			var temp = {"target":targetCounter, "error":[], "assignment":assignments[i].id};
			allTargets.push(temp);
			targetCounter++;
		};
	};

	for (var i = 0; i < allData.length; i++) {
		//for each real user
		if(allData[i].userId > lastDevUser){
			targetCounter = 0;
			for (var j = 0; j < allData[i].data.length; j++) {
				//for each completed assignment
				for (var k = 0; k < assignments.length; k++) {
					if(assignments[k].id == allData[i].data[j].assignment){
						//found that assignment
						for (var l = 0; l < assignments[k].targets.length; l++) {
							//for each target in that assignment
							var shouldBe = allData[i].data[j].systemOptions.scale[assignments[k].targets[l]-1];
							// console.log("should be: "+shouldBe);
							var cumError = 0;
							for (var m = 0; m < allData[i].data[j].attempts.length; m++) {
								for (var n = 0; n < allData[i].data[j].attempts[m].length; n++) {
									cumError += Math.abs(allData[i].data[j].attempts[m][n].cents - shouldBe);
								};
							};
							for (var m = 0; m < allTargets.length; m++) {
								if(allTargets[m].target == targetCounter){
									if(cumError < 2000000) allTargets[m].error.push(cumError);
								}
							};
							targetCounter++;
						};
					}
				};
			};
		}
	};
	for (var i = 0; i < allTargets.length; i++) {
		var entries = allTargets[i].error.length;
		var total = 0;
		for (var j = 0; j < allTargets[i].error.length; j++) {
			total += allTargets[i].error[j];
		};
		if(entries == 0) allTargets[i].error = 0;
		else allTargets[i].error = Math.round(total/entries);
	};

	// console.log(JSON.stringify(allTargets));

	//
	var margin = {top: 20, right: 20, bottom: 30, left: 60},
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

	var svg = d3.select("#totalError").append("svg")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr('viewBox','0 0 '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom))+' '+Math.min((width+margin.left+margin.right),(height+margin.top+margin.bottom)))
	    .attr('preserveAspectRatio','xMinYMin')
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var data = allTargets;
	x.domain(data.map(function(d) { return d.target; }));
	y.domain([0, d3.max(data, function(d) { return d.error; })]);

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
	    .text("Total error");

	svg.selectAll(".bar")
	    .data(data)
	  .enter().append("rect")
	  	.attr("class", "bar")
	    .attr("fill", function(d){
	    	return "hsl("+((d.assignment-1)%12)*30+", 100%, 50%)";
	    })
	    .attr("x", function(d) { return x(d.target); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.error); })
	    .attr("height", function(d) { return height - y(d.error); });
}