var freqs = [440, 466.164, 493.883, 523.252, 554.366, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305];
var notes = ["A", "A#/Bb", "B",     "C",     "C#/Db", "D",     "D#/Eb", "E",     "F",     "F#/Gb", "G",     "G#"];
var scale = [0,200,400,500,700,900,1100];//major scale
var audioContext = new AudioContext();
var tonic = 440;
var cents = 0;
var myInstrument;
var assignment;
var perf;
var slack = 10;
var perfs=[];
var user;

var smoother = [0,0,0,0,0];

var options = {
		"clickable":[true,true,true,true,true,true,true],
		"tonic":"random",
		"temperament":"equal",
		"A":440
	}; //click to hear which notes?

$(function(){

	detector = new PitchDetector({
	    // Audio Context (Required)
	    context: audioContext,

	    // Input AudioNode (Required)
	    //input: null, // default: Microphone input

	    // Output AudioNode (Optional)
	    //output: AudioNode, // default: no output

	    // interpolate frequency (Optional)
	    //
	    // Auto-correlation is calculated for different (discrete) signal periods
	    // The true frequency is often in-beween two periods.
	    //
	    // We can interpolate (very hacky) by looking at neighbours of the best 
	    // auto-correlation period and shifting the frequency a bit towards the
	    // highest neighbour.
	    interpolateFrequency: true, // default: true

	    // Callback on pitch detection (Optional)
	    onDetect: function(stats, pitchDetector) { 
	        stats.frequency // 440
	        stats.detected // --> true
	        stats.worst_correlation // 0.03 - local minimum, not global minimum!
	        stats.best_correlation // 0.98
	        stats.worst_period // 80
	        stats.best_period // 100
	        stats.time // 2.2332 - audioContext.currentTime
	        stats.rms // 0.02 

	        if(stats.detected){
	        	//var pitch = constrainPitch();
	        	$("#hz").html(stats.frequency);
	        	var fraction = Math.log(stats.frequency/freqs[0])/Math.log(2);
	        	if (fraction > 1) fraction = fraction%1;
	        	else if (fraction < 0) fraction = fraction*2;
	        	if (fraction < 0) fraction = fraction*2;
	        	var cents = Math.round(1200*fraction); //rounding to the neared cent (for beter or worse)
	        	var average = 0;
	        	// for (var i = smoother.length - 1; i >= 0; i--) {
	        	// 	average += smoother[i];
	        	// };
	        	// average = average / (smoother.length*1.0);
	        	var smoothed = mode(smoother);
	        	//console.log(smoothed);
	        	if((cents < smoothed*1.1) || (cents > smoothed*0.9)){
	        		//not an error
	        		$("#ballcircle").css("opacity", "1");
	        		for (var i = smoother.length - 1; i >= 1; i--) {
	        			smoother[i] = smoother[i-1];
	        		};
	        		smoother[0] = cents;
	        		//rotate(mode(smoother), options.temperament);
	        		rotate(cents, options.temperament)
	        		if(assignment && perf.progress.indexOf(false) > -1){
	        			perf.attempts[perf.progress.indexOf(false)].push({"cents":cents, "time":audioContext.currentTime});
	        			if(cents < scale[assignment.targets[perf.progress.indexOf(false)]-1]+slack && cents > scale[assignment.targets[perf.progress.indexOf(false)]-1]-slack){
	        				//console.log("nailed it");
	        				perf.correctFrames++;
	        				// $("#radialStop2").attr("stop-opacity", perf.correctFrames/assignment.reqFrames);
	        				// $("#radialStop2").attr("offset", 100*perf.correctFrames/assignment.reqFrames+"%");
	        				var max = perf.correctFrames/assignment.reqFrames;
	        				if (max > 1) max = 1;
	        				$("#progress").css("transform", "scale("+max+")");
	        			}
	        			if(perf.correctFrames > assignment.reqFrames){
	        				//victory!
	        				//the one just finished
	        				var piece1 = (assignment.targets[perf.progress.indexOf(false)]*2)-1;
							var piece2 = assignment.targets[perf.progress.indexOf(false)]*2;
	        				$($("#circle > path").get(piece1-1)).attr("stroke", "black");
							$($("#circle > path").get(piece2-1)).attr("stroke", "black");
							$($("#circle > path").get(piece1-1)).removeClass("transparent");
							$($("#circle > path").get(piece2-1)).removeClass("transparent");
							$($("#circle > path").get(piece1-1)).addClass("notTransparent");
							$($("#circle > path").get(piece2-1)).addClass("notTransparent");
							$($("#circle > path").get(piece1-1)).addClass("transparent");
							$($("#circle > path").get(piece2-1)).addClass("transparent");
							$($("#circle > path").get(piece1-1)).removeClass("notTransparent");
							$($("#circle > path").get(piece2-1)).removeClass("notTransparent");
							var color = $($(".progressDot").get(perf.progress.indexOf(false))).attr("stroke");
							$($(".progressDot").get(perf.progress.indexOf(false))).attr("fill", color);
							if(assignment.targets.length > 3){
								var color = determineColor(1+(piece2/2));
							}
							else{
								var color = determineColor(1+(piece2/2));
							}

							//moving on
							perf.correctFrames = 0;
							perf.progress[perf.progress.indexOf(false)] = true;
	         				var piece1 = (assignment.targets[perf.progress.indexOf(false)]*2)-1;
							var piece2 = assignment.targets[perf.progress.indexOf(false)]*2;
							$($(".progressDot").get(perf.progress.indexOf(false))).attr("stroke", color);
							$("#ballcircle > path").first().attr("fill", color);
	         				window.setTimeout(function(){if(perf.progress.indexOf(false) != 0) $("#progress").attr("fill", color);}, 100)
	         				$("#progress").css("transform", "scale(0)");
	         				$($("#circle > path").get(piece1-1)).attr("fill", color);
							$($("#circle > path").get(piece2-1)).attr("fill", color);
							$("use#use1").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[perf.progress.indexOf(false)]*2)-1)).attr("id"));
							$("use#use2").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[perf.progress.indexOf(false)]*2)-2)).attr("id"));
							if(perf.progress.indexOf(false) < 0){
			        			//done with assignment
								$("#circle > path").attr("fill", "none");
								$("#circle > path").removeClass("transparent");
								//update progress bar
								perfs.push(perf);
								updateProgressBar();
								$(".progressDot").attr("stroke", "none");
								$(".progressDot").attr("fill", "none");
								//go to new assignment
			        			if(assignment) loadAssignment(assignment.id+1);
			        			else loadAssignment(null);
								
								//save
								//start feedback
								var stringified = JSON.stringify(perfs);
								$.post( "php/save.php", {"userId":user, "perfs":stringified}, function(data) {
									if(data == "success"){
										console.log("saved!");
										//end feedback
									}
									else console.log("something went wrong?");
									console.log("data: "+data);
								});
							}
	        			}
	        		}
	        		else{
	        			//maybe nothing?
	        		}

	        	}
	        	else $("#ballcircle").css("opacity", ".25");
	        	$("#cents").html(cents);
	        }
	    },

	    // Debug Callback for visualisation (Optional)
	    onDebug: function(stats, pitchDetector) { },

	    // Minimal signal strength (RMS, Optional)
	    minRms: 0.05,

	    // Detect pitch only with minimal correlation of: (Optional)
	    minCorrelation: 0.9,

	    // Detect pitch only if correlation increases with at least: (Optional)
	    //minCorreationIncrease: 0.5,

	    // Note: you cannot use minCorrelation and minCorreationIncrease
	    // at the same time!

	    // Signal Normalization (Optional)
	    normalize: "rms", // or "peak". default: undefined

	    // Only detect pitch once: (Optional)
	    stopAfterDetection: false,

	    // Buffer length (Optional)
	    length: 1024, // default 1024

	    // Limit range (Optional):
	    //minNote: 69, // by MIDI note number
	    //maxNote: 80, 

	    minFrequency: 40,    // by Frequency in Hz
	    maxFrequency: 1000,

	    minPeriod: 2,  // by period (i.e. actual distance of calculation in audio buffer)
	    maxPeriod: 512, // --> convert to frequency: frequency = sampleRate / period

	    // Start right away
	    start: true // default: false
	});

	//event listeners
	addEventListeners(options);

	//make tonic
	makeTonic();

	//timbre
	var instrument = Organ_2;
	var real = new Float32Array(instrument.real.length);
	var imag = new Float32Array(instrument.imag.length);
	for (var i = 0; i < instrument.real.length; i++) {
	  real[i] = instrument.real[i];
	  imag[i] = instrument.imag[i];
	}
	myInstrument = audioContext.createPeriodicWave(real, imag);

	//check if user yet
	user = localStorage.getItem("userId");
	if(!user){
		console.log("You're not a user yet");
		//get an Id for them
		$.post( "php/new.php", function(data) {
			localStorage.setItem("userId", data);
			//start assignment 1
			loadAssignment(1);
		});
	}
	else{
		//get their most recent data
		console.log("you are user: "+user);
		$.post( "php/returning.php", {"userId":user}, function(data) {
			//figure out where they are
			var temp = [];
			if(data == "new" || data == ""){
				loadAssignment(1);
			}
			else{
				perfs = JSON.parse(data);
				for (var i = perfs.length - 1; i >= 0; i--) {
					temp.push(perfs[i].assignment);
				};
				for (var i = 0; i < assignments.length; i++) {
					if(temp.indexOf(assignments[i].id) < 0){
						loadAssignment(assignments[i].id);
						break;
					}
				};
			}
			updateProgressBar();
		});
	}

});

function rotate(cents, temperament){
	//destroying the unequal distnces between notes in a scale
	//all notes are equidistant from eachother...!
	if(options.temperament == "equal"){
		//todo: derive the note boundaries from the scale
		var linearDegrees = (cents/1200)*360.0;
		//$("#ballcircle").css("transform", "rotate("+((cents/1200)*360.0)+"deg)");

		//both offsets together
		//you could also visual offset, then scale offset to avoid some jerkiness?
		if(cents >= 100 && cents < 300){
			linearDegrees -= 7.5;
			//$("#ballcircle").css("transform", "rotate("+linearDegrees+"deg)");
		}
		else if(cents >= 300 && cents < 450){
			linearDegrees -= 16.5;
		}
		else if(cents >= 450 && cents < 600){
			linearDegrees += 4.5;
		}
		else if(cents >= 600 && cents < 800){
			linearDegrees -= 4.5;
		}
		else if(cents >= 800 && cents < 1000){
			linearDegrees -= 13.5;
		}
		else if(cents >= 1000 && cents < 1150){
			linearDegrees -= 22.5;
		}
		else $("#ballcircle").css("transform", "rotate("+((cents/1200)*360.0)+"deg)");
		$("#ballcircle").css("transform", "rotate("+linearDegrees+"deg)");
	}
}

function mode(array){
	//http://stackoverflow.com/questions/3783950/get-the-item-that-appears-the-most-times-in-an-array
	var store = array;
	var frequency = {};  // array of frequency.
	var max = 0;  // holds the max frequency.
	var result;   // holds the max frequency element.
	for(var v in store) {
	        frequency[store[v]]=(frequency[store[v]] || 0)+1; // increment frequency.
	        if(frequency[store[v]] > max) { // is this frequency > max so far ?
	                max = frequency[store[v]];  // update max.
	                result = store[v];          // update result.
	        }
	}
	return result;
}

function playNote(which){
	// var osc = audioContext.createOscillator();
	// osc.connect(audioContext.destination);
	// osc.setPeriodicWave(myInstrument);
	// osc.frequency.value = which/2;
	// osc.start();
	// osc.stop(audioContext.currentTime+0.5);
	// console.log("generating: "+which);
	// var osc2 = audioContext.createOscillator();
	// osc2.connect(audioContext.destination);
	// osc2.setPeriodicWave(myInstrument);
	// osc2.frequency.value = which*2;
	// osc2.start();
	// osc2.stop(audioContext.currentTime+0.5);

	var osc2 = audioContext.createOscillator();
	osc2.connect(audioContext.destination);
	osc2.setPeriodicWave(myInstrument);
	osc2.frequency.value = which;
	osc2.start();
	osc2.stop(audioContext.currentTime+0.5);
}

function addEventListeners(options){
	//this should probably be a for loop...
	if(options.clickable[0]){
		$("#one_in, #one_out").on('mousedown', function(e){
			playNote(freqs[0]);
		});
	}
	if(options.clickable[1]){
		$("#two_in, #two_out").on('mousedown', function(e){
			//console.log("play note 2");
			playNote(freqs[2]);
		});
	}
	if(options.clickable[2]){
		$("#three_in, #three_out").on('mousedown', function(e){
			playNote(freqs[4]);
		});
	}
	if(options.clickable[3]){
		$("#four_in, #four_out").on('mousedown', function(e){
			playNote(freqs[5]);
		});
	}
	if(options.clickable[4]){
		$("#five_in, #five_out").on('mousedown', function(e){
			playNote(freqs[7]);
		});
	}
	if(options.clickable[5]){
		$("#six_in, #six_out").on('mousedown', function(e){
			playNote(freqs[9]);
		});
	}
	if(options.clickable[6]){
		$("#seven_in, #seven_out").on('mousedown', function(e){
			playNote(freqs[11]);
		});
	}
}

function makeTonic(){
	var tonic = Math.round(Math.random()*12);
	if(options.A > 439) options.A = options.A/2;
	$("#tonic").html(tonic);
	freqs[0] = options.A*Math.pow(2, tonic/12);
	for (var i = 0; i < freqs.length; i++) {
		freqs[i] = options.A*Math.pow(2, (tonic+i)/12);
	};
}

function loadAssignment(which){
	if(!assignAssignmnet(which)){
		//free play
		$("#ballcircle > path").first().attr("fill", "black");
		$("#ballcircle > path").first().attr("stroke", "black");
		$("#circle > path").attr("stroke", "black");
		updateProgressBar();
	}
	else{
		
		perf = {
			"systemOptions":options,
			"attempts":[],
			"assignment":which,
			"progress":[],
			"correctFrames":0
		};
		for (var i = assignment.targets.length - 1; i >= 0; i--) {
			perf.progress[i] = false;
		};
		for (var i = assignment.targets.length - 1; i >= 0; i--) {
			perf.attempts[i] = [];
		};

		var color = "hsl("+assignment.color[0]+","+assignment.color[1]+"%,"+assignment.color[2]+"%)";
		$("#progress").attr("fill", color);
		$("#progress").css("transform", "scale(0)");
		$("#ballcircle > path").first().attr("fill", color);
		$("#circle > path").first().attr("fill", color);
		$($("#circle > path").get(1)).attr("fill", color);
		$("use#use1").attr("xlink:href", "#"+$("#circle > path").first().attr("id"));
		$("use#use2").attr("xlink:href", "#"+$($("#circle > path").get(1)).attr("id"));
		$("#angle").attr("fill", color);
		$("#notAngle").attr("fill", color);

		$(".progressDot").attr("stroke", "none");
		$(".progressDot").attr("fill", "none");
		//last one is 580, first one is 22
		for (var i = 0; i < assignment.targets.length; i++) {
			$($(".progressDot").get(i)).attr("cx", 22+((i)*558/(assignment.targets.length-1))).attr("stroke", "black");
		};
		$($(".progressDot").get(0)).attr("stroke", color);
		updateProgressBar();
	}
}

function assignAssignmnet(which){
	assignment = null;
	for (var i = assignments.length - 1; i >= 0; i--) {
		if(assignments[i].id == which){
			assignment = assignments[i];
			//console.log("assigned "+which);
		}
	};
	if(assignment == null) return false;
	else return true;
}

function updateProgressBar(){
	var total = assignments.length;
	var completed = [];
	for (var i = perfs.length - 1; i >= 0; i--) {
		if(perfs[i].progress.indexOf(false) < 0){
			if(completed.indexOf(perfs[i].assignment) < 0){
				completed.push(perfs[i].assignment);
			}
		}
	};
	var percent = completed.length/total;
	//42px angle difference
	//22 - 538
	var change = 516/total;
	$("#angle")[0].points.getItem(1).x = 42+22+(516*percent);
	$("#angle")[0].points.getItem(2).x = 22+(516*percent);
}

function determineColor(pie) {
	var baseh = assignment.color[0];
	var bases = assignment.color[1];
	var basel = assignment.color[2];
	if(pie == 1) return "hsl("+baseh+","+bases+"%,"+basel+"%)";
	if(pie == 2) return "hsl("+(baseh+(2*(180/5)))+","+bases+"%,"+basel+"%)";
	if(pie == 3) return "hsl("+(baseh+(3*(180/5)))+","+bases+"%,"+basel+"%)";
	if(pie == 4) return "hsl("+(baseh+(4*(180/5)))+","+bases+"%,"+basel+"%)";
	if(pie == 5) return "hsl("+(baseh+(5*(180/5)))+","+bases+"%,"+basel+"%)";
	if(pie == 6) return "hsl("+(180+(1*(180/3)))+","+bases+"%,"+basel+"%)";
	if(pie == 7) return "hsl("+(180+(2*(180/3)))+","+bases+"%,"+basel+"%)";
}

var assignments = [
	{
		"targets" : [1,2,3,4,5,6,7],
		"viz":"scale-full",
		"id":1,
		"prompt":true,
		"reqFrames":20,
		"color": [0,100,50]
	},
	{
		"targets" : [1,2,3,4,5],
		"viz":"scale-full",
		"id":2,
		"prompt":true,
		"reqFrames":20,
		"color": [310,100,50]
	},
	{
		"targets" : [1,3,5],
		"viz":"scale-full",
		"id":3,
		"prompt":true,
		"reqFrames":20,
		"color": [250,100,50]
	}
];