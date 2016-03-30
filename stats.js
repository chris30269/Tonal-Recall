var allData;
var timeToTarget={};

$(function(){
	$.post( "php/stats.php", function(data) {
		allData = JSON.parse(data);
		timeToTargets();
	});
});

function timeToTargets(){
	for (var i = 0; i < allData.length; i++) {
		//for each user
		for (var j = 0; j < allData[i].data.length; j++) {
			//for each user's data
			if(!timeToTarget[i]) timeToTarget[i]=[];
			//timeToTarget[j].push(allData[i].data[j]);
			if(!timeToTarget[i][allData[i].data[j].assignment-1]) timeToTarget[i][allData[i].data[j].assignment-1] = [];
			//timeToTarget[allData[i].data[j].assignment].push(allData[i].data[j].);
			for (var k = 0; k < allData[i].data[j].attempts.length; k++) {
				//for each user's notes in each assignment
				if(!timeToTarget[i][allData[i].data[j].assignment-1][k]) timeToTarget[i][allData[i].data[j].assignment-1][k] = [];
				// timeToTarget[i][j][k].push(allData[i].data[j].attempts[k]);
			};
		};
	};
}