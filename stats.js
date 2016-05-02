var allData;
var lastDevUser = 24;
var surveys;
var likertData;
var userId = null;
var allDataPerm;

//time to do each assignment

//time to hit each target

//variance in hitting each target

$(function(){
	$.post( "php/stats.php", function(data) {
		// console.log(data);
		// console.log("loaded all data");
		allData = JSON.parse(data);
		people();
		whenJoined();
		// console.log(userId);
	});
	// people();
	// whenJoined();
	// assignmentsCompleted();
	// timeToAssignment();
	// timeToTarget();
	// totalError();
	// survey();
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
		if(allData[i].data != "" && allData[i] != "new" && allData[i].userId > lastDevUser){
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

	//lol callback
	if(window.location.href.indexOf("?userId")){
		userId = window.location.href.substr(window.location.href.indexOf("?userId")+8);
		allDataPerm = allData;
		for (var i = 0; i < allData.length; i++) {
			if(allData[i].userId == userId) allData = [allData[i]];
		};
	}
	assignmentsCompleted();
	timeToAssignment();
	timeToTarget();
	totalError();
	survey();
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


	// console.log(JSON.stringify(assignmentTargets));
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
			.attr("class","sdLines");
}

function timeToTarget(){
	var assignmentTargets = [];
	for (var i = 0; i < assignments.length; i++) {
		var temp = {"assignment":assignments[i].id, "targets":[], "sds":[]};
		assignmentTargets.push(temp);
	};
	for (var i = 0; i < assignments.length; i++) {
		for (var j = 0; j < assignments[i].targets.length; j++) {
			assignmentTargets[i].targets.push([]);
			assignmentTargets[i].sds.push([]);
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
								assignmentTargets[k].sds[l].push(dur);
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
			if(assignmentTargets[i].sds[j].length>1) assignmentTargets[i].sds[j] = d3.deviation(assignmentTargets[i].targets[j]);
			else assignmentTargets[i].sds[j] = 0;
			assignmentTargets[i].targets[j] = total/assignmentTargets[i].targets[j].length;
		};
	};

	// console.log(JSON.stringify(assignmentTargets));

	var allTargets = [];
	var counter = 0;
	for (var i = 0; i < assignmentTargets.length; i++) {
		for (var j = 0; j < assignmentTargets[i].targets.length; j++) {
			if(assignmentTargets[i].targets[j] >-1){
				var temp = {"time":assignmentTargets[i].targets[j], "which":counter+1, "sd":assignmentTargets[i].sds[j], "assignment":assignmentTargets[i].assignment};
				allTargets.push(temp);
			}
			else{
				var temp = {"time":0, "which":counter+1, "assignment":assignmentTargets[i].assignment, "sd":0};
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

	svg.selectAll(".sdLines")
		.data(data).enter().append("line")
			.attr("x1", function(d) { return x(d.which)+Math.floor(x.rangeBand()/2); })
			.attr("y1", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.time-(d.sd/2));
			})
			.attr("x2", function(d) { return x(d.which)+Math.floor(x.rangeBand()/2); })
			.attr("y2", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.time+(d.sd/2));
			})
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("class","sdLines");

	function type(d) {
	  d.time = +d.time;
	  return d;
	}
}

function totalError(){
	var allTargets = [];
	var targetCounter = 0;
	//make a spot for each target
	for (var i = 0; i < assignments.length; i++) {
		for (var j = 0; j < assignments[i].targets.length; j++) {
			var temp = {"target":targetCounter, "error":[], "assignment":assignments[i].id, "sd":0};
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
		allTargets[i].sd = allTargets[i].error;
		if(entries == 0){
			allTargets[i].error = 0;
			allTargets[i].sd = 0;
		}
		else if(entries == 1) allTargets[i].sd = 0;
		else{
			allTargets[i].sd = d3.deviation(allTargets[i].sd);
			allTargets[i].error = Math.round(total/entries);
		}
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

	svg.selectAll(".sdLines")
		.data(data).enter().append("line")
			.attr("x1", function(d) { return x(d.target)+Math.floor(x.rangeBand()/2); })
			.attr("y1", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.error-(d.sd/2));
			})
			.attr("x2", function(d) { return x(d.target)+Math.floor(x.rangeBand()/2); })
			.attr("y2", function(d) {
				if(d.sd == 0) return 0;
				else return y(d.error+(d.sd/2));
			})
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("class","sdLines");
}

function survey(){
	//maybe a scatterplot of number of assignments completed vs response?
	var q1 = [];
	var q2 = [];
	var q3 = [];
	var q4 = [];
	var q5 = [];
	var q6 = [];
	var q7 = [];
	var q8 = [];
	var q9 = [];
	var q10 = [];
	var q11= [];
	var q12 = [];
	var q13 = [];
	var q14 = [];
	var q15 = [];
	var q16 = [];

	surveys = [];
	for (var i = 0; i < allData.length; i++) {
		if(allData[i].survey != "" && allData[i].survey != undefined && allData[i].userId > lastDevUser) surveys.push(allData[i].survey);
	};
	// console.log(surveys);
	likertData = [
        {
        	"name": "I already had a good sense of tonality, before using this system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I think my sense of tonality is better after using the system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I would like to continue using this system to better my musicianship.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I feel more confident in my sense of tonality after using the system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "This system directly complements my musical goals.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I think that I would like to use this system frequently.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I found the system unnecessarily complex.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I thought the system was easy to use.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I think that I would need the support of a technical person to be able to use this system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I found the various functions in this system were well integrated.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I thought there was too much inconsistency in this system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I would imagine that most people would learn to use this system very quickly.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I found the system very cumbersome to use.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I felt very confident using the system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        },
        {
        	"name": "I needed to learn a lot of things before I could get going with this system.",
            "rating": {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0
            },
            "followups":[],
            "avg":[]
        }
    ];
    for (var i = 0; i < surveys.length; i++) {
    	for (var j = 0; j < surveys[i].questions.length; j++) {
    		if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question1") && surveys[i].questions[j].question1 != ""){
    			likertData[0].rating[surveys[i].questions[j].question1]++;
    			likertData[0].avg.push(1.0*surveys[i].questions[j].question1);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question2") && surveys[i].questions[j].question2 != ""){
    			likertData[1].rating[surveys[i].questions[j].question2]++;
    			likertData[1].avg.push(1.0*surveys[i].questions[j].question2);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question3") && surveys[i].questions[j].question3 != ""){
    			q3.push(surveys[i].questions[j].question3);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question4") && surveys[i].questions[j].question4 != ""){
    			likertData[2].rating[surveys[i].questions[j].question4]++;
    			likertData[2].avg.push(1.0*surveys[i].questions[j].question4);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question5") && surveys[i].questions[j].question5 != ""){
    			likertData[3].rating[surveys[i].questions[j].question5]++;
    			likertData[3].avg.push(1.0*surveys[i].questions[j].question5);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question6") && surveys[i].questions[j].question6 != ""){
    			likertData[4].rating[surveys[i].questions[j].question6]++;
    			likertData[4].avg.push(1.0*surveys[i].questions[j].question6);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question7") && surveys[i].questions[j].question7 != ""){
    			likertData[5].rating[surveys[i].questions[j].question7]++;
    			likertData[5].avg.push(1.0*surveys[i].questions[j].question7);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question8") && surveys[i].questions[j].question8 != ""){
    			likertData[6].rating[surveys[i].questions[j].question8]++;
    			likertData[6].avg.push(1.0*surveys[i].questions[j].question8);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question9") && surveys[i].questions[j].question9 != ""){
    			likertData[7].rating[surveys[i].questions[j].question9]++;
    			likertData[7].avg.push(1.0*surveys[i].questions[j].question9);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question10") && surveys[i].questions[j].question10 != ""){
    			likertData[8].rating[surveys[i].questions[j].question10]++;
    			likertData[8].avg.push(1.0*surveys[i].questions[j].question10);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question11") && surveys[i].questions[j].question11 != ""){
    			likertData[9].rating[surveys[i].questions[j].question11]++;
    			likertData[9].avg.push(1.0*surveys[i].questions[j].question11);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question12") && surveys[i].questions[j].question12 != ""){
    			likertData[10].rating[surveys[i].questions[j].question12]++;
    			likertData[10].avg.push(1.0*surveys[i].questions[j].question12);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question13") && surveys[i].questions[j].question13 != ""){
    			likertData[11].rating[surveys[i].questions[j].question13]++;
    			likertData[11].avg.push(1.0*surveys[i].questions[j].question13);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question14") && surveys[i].questions[j].question14 != ""){
    			likertData[12].rating[surveys[i].questions[j].question14]++;
    			likertData[12].avg.push(1.0*surveys[i].questions[j].question14);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question15") && surveys[i].questions[j].question15 != ""){
    			likertData[13].rating[surveys[i].questions[j].question15]++;
    			likertData[13].avg.push(1.0*surveys[i].questions[j].question15);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question16") && surveys[i].questions[j].question16 != ""){
    			likertData[14].rating[surveys[i].questions[j].question16]++;
    			likertData[14].avg.push(1.0*surveys[i].questions[j].question16);
	    	}
	    	if(surveys[i].questions[j] && surveys[i].questions[j].hasOwnProperty("question17") && surveys[i].questions[j].question17 != ""){
    			$("#surveyResults").append("<p>"+surveys[i].questions[j].question17+"</p>");
	    	}
	    	// console.log("processed a survey");
    	};
    	for (var j = 0; j < surveys[i].followups.length; j++) {
    		if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup1") && surveys[i].followups[j].followup1 != ""){
    			likertData[0].followups.push(surveys[i].followups[j].followup1);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup2") && surveys[i].followups[j].followup2 != ""){
    			likertData[1].followups.push(surveys[i].followups[j].followup2);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup4") && surveys[i].followups[j].followup4 != ""){
    			likertData[2].followups.push(surveys[i].followups[j].followup4);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup5") && surveys[i].followups[j].followup5 != ""){
    			likertData[3].followups.push(surveys[i].followups[j].followup5);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup6") && surveys[i].followups[j].followup6 != ""){
    			likertData[4].followups.push(surveys[i].followups[j].followup6);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup7") && surveys[i].followups[j].followup7 != ""){
    			likertData[5].followups.push(surveys[i].followups[j].followup7);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup8") && surveys[i].followups[j].followup8 != ""){
    			likertData[6].followups.push(surveys[i].followups[j].followup8);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup9") && surveys[i].followups[j].followup9 != ""){
    			likertData[7].followups.push(surveys[i].followups[j].followup9);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup10") && surveys[i].followups[j].followup10 != ""){
    			likertData[8].followups.push(surveys[i].followups[j].followup10);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup11") && surveys[i].followups[j].followup11 != ""){
    			likertData[9].followups.push(surveys[i].followups[j].followup11);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup12") && surveys[i].followups[j].followup12 != ""){
    			likertData[10].followups.push(surveys[i].followups[j].followup12);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup13") && surveys[i].followups[j].followup13 != ""){
    			likertData[11].followups.push(surveys[i].followups[j].followup13);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup14") && surveys[i].followups[j].followup14 != ""){
    			likertData[12].followups.push(surveys[i].followups[j].followup14);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup15") && surveys[i].followups[j].followup15 != ""){
    			likertData[13].followups.push(surveys[i].followups[j].followup15);
	    	}
	    	if(surveys[i].followups[j] && surveys[i].followups[j].hasOwnProperty("followup16") && surveys[i].followups[j].followup16 != ""){
    			likertData[14].followups.push(surveys[i].followups[j].followup16);
	    	}
    	};
	};
	d3Likert('#surveyResults', likertData, {height: 740, width: $('#surveyResults').width() });
	// console.log(q3);
	var avg = 0;
	for (var i = 0; i < q3.length; i++) {
		//$('#surveyResults').append("<p>"+q3[i]+"%</p>");
		avg+=1.0*q3[i];
	};
	var n = q3.length;
	avg = avg/q3.length;
	var string = "";
	string += "<table><tr><td>I think my sense of tonality got better by the following percentage</td><td>"+Math.round(avg*100)/100+"%</td><td>n="+n+"</td></tr>";

	for (var i = 0; i < likertData.length; i++) {
		avg = 0;
		for (var j = 0; j < likertData[i].avg.length; j++) {
		 	avg += 1.0*likertData[i].avg[j];
		};
		n = likertData[i].avg.length;
		likertData[i].avg = avg/likertData[i].avg.length;
		string += "<tr><td>"+likertData[i].name+"</td><td>"+Math.round(likertData[i].avg*100)/100+"</td><td>n="+n+"</td></tr>";
	};
	string += "</table>";
	$('#surveyResults').append(string);
}