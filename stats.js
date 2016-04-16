var allData;
var timeToTarget={};

//time to do each assignment

//time to hit each target

//variance in hitting each target

$(function(){
	$.post( "php/stats.php", function(data) {
		allData = JSON.parse(data);
		timeToTargets();
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