//var freqs = [440, 466.164, 493.883, 523.252, 554.366, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305];
var notes = ["A", "A#/Bb", "B",     "C",     "C#/Db", "D",     "D#/Eb", "E",     "F",     "F#/Gb", "G",     "G#"];
//var scale = [0,200,400,500,700,900,1100];//major scale
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
//var tonic = 440;
var cents = 0;
var myInstrument;
var assignment;
var perf;
var slack = 10;
var perfs=[];
var user;
var animationDelay = 0.1; //seconds between demo notes
//[0,50,100,150,200,250,300, 350]
//[0,200,400,500,700,900,1100, 1200] //major

var smoother = [0,0,0,0,0,0,0,0,0,0];

var options = {
		"tonic":"random",
		"temperament":"equal",
		"A":440,
		"scale": [0,200,400,500,700,900,1100, 1200],
		"freqs": [440, 466.164, 493.883, 523.252, 554.366, 293.665, 311.127, 329.628, 349.228, 369.994, 391.995, 415.305],
		"colors":[0,10,20,30,40,50,60]
	}; //click to hear which notes?

var tour;

$(function(){
	//get the tour ready
	tour = new Shepherd.Tour({
		defaults: {
			classes: 'shepherd-theme-dark',
			scrollTo: false
		}
	});
	tour.addStep('step1', {
		title : "The Ball",
		text: 'The colored ball represents the note you\'re currently singing.',
		attachTo: '#ballcircle bottom',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step2', {
		title : "Your Current Target",
		text: 'Use your voice to get the ball in the hole.',
		attachTo: '#one_out top',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step3', {
		title : "Hold the Note",
		text: 'Find the note, and hold it until the bubble fills this area.',
		attachTo: '#progress bottom',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step4', {
		title : "To Help You Along",
		text: 'During the activities, you\'ll hear the exercise before you do it. You\'ll also be able to click to hear the note again. But as you get better, there will be less help available.',
		attachTo: '#one_in bottom',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step5', {
		title : "Notes in the Activity",
		text: 'The number of bubbles here shows you how many notes are in this activity.',
		attachTo: '#bar bottom',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step6', {
		text: 'See how many activities there are, repeat an activity, read the consent form, or take the survey.',
		attachTo: '#menu right',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Cancel',
				classes: 'shepherd-button-secondary',
				action: tour.cancel
			},
			{
				text: 'Next',
				action: tour.next
			}
		]
	});
	tour.addStep('step7', {
		text: 'Click here to access this tour at any time.',
		attachTo: '#help right',
		classes: 'shepherd-theme-dark',
		buttons: [
			{
				text: 'Got it!',
				action: tour.complete
			}
		]
	});
	tour.on("cancel", function(){
		demoAss(assignment.prompt);
	});
	tour.on("complete", function(){
		demoAss(assignment.prompt);
	});

	//check if they have technology
	if(!audioContext || !(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)){
		alert("Looks like you're using a browser I don't support. Sorry about that. Feel free to poke around anyway.");
		tour.start();
	}
	else{
		//standing by
		$("#progress").css("transform", "scale(.5)");
		$("#progress").addClass("loading");

		//check if user yet
		user = localStorage.getItem("userId");
		if(!user){
			console.log("You're not a user yet");
			//get consent
			window.location.href = "consent.html";
		}
		else{
			//get their most recent data
			console.log("you are user: "+user);
			$.post( "php/returning.php", {"userId":user}, function(data) {
				//figure out where they are
				var temp = [];
				if(data == "new" || data == ""){
					loadAssignment(1);
					tour.start();
				}
				else{
					perfs = JSON.parse(data);
					for (var i = perfs.length - 1; i >= 0; i--) {
						temp.push(perfs[i].assignment);
					};
					var found = false;
					for (var i = 0; i < assignments.length; i++) {
						if(temp.indexOf(assignments[i].id) < 0 && !found){
							loadAssignment(assignments[i].id);
							found = true;
						}
					};
				}
				$("#progress").css("transform", "scale(0)");
				$("#progress").removeClass("loading");
			});
		}
	}

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
	        	var fraction = Math.log(stats.frequency/options.freqs[0])/Math.log(2)%1;
	        	var cents = Math.round(1200*fraction); //rounding to the neared cent (for beter or worse)
	        	if(assignment.targets[perf.progress.indexOf(false)] != 1){
	        		cents = cents + 2400;
		        	cents = cents%1200;
		        }
	        	// var average = 0;
	        	// for (var i = smoother.length - 1; i >= 0; i--) {
	        	// 	average += smoother[i];
	        	// };
	        	// average = average / (smoother.length*1.0);
	        	// var smoothed = mode(smoother);
	        	//console.log(smoothed);
	        	// if((cents < smoothed*1.1) || (cents > smoothed*0.9)){
	        	// 	//not an error
	        		// $("#ballcircle").css("opacity", "1");
	        		for (var i = smoother.length - 1; i >= 1; i--) {
	        			smoother[i] = smoother[i-1];
	        		};
	        		smoother[0] = cents;
	        		rotate(mode(smoother), options.temperament);
	        		// rotate(cents, options.temperament)
	        		if(assignment && perf.progress.indexOf(false) > -1){
	        			perf.attempts[perf.progress.indexOf(false)].push({"cents":cents, "time":audioContext.currentTime});
	        			if(cents < options.scale[assignment.targets[perf.progress.indexOf(false)]-1]+slack && cents > options.scale[assignment.targets[perf.progress.indexOf(false)]-1]-slack){
	        				//console.log("nailed it");
	        				perf.correctFrames++;
	        				var max = perf.correctFrames/assignment.reqFrames[perf.progress.indexOf(false)];
	        				if (max > 1) max = 1;
	        				$("#progress").css("transform", "scale("+max+")");
	        			}
	        			if(perf.correctFrames > assignment.reqFrames[perf.progress.indexOf(false)]){
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
							$($(".progressDot").get(perf.progress.indexOf(false))).attr("stroke", "black");

							//moving on
							var color = determineColor(assignment.targets[perf.progress.indexOf(false)+1]);
							perf.correctFrames = 0;
							perf.progress[perf.progress.indexOf(false)] = true;
	         				var piece1 = (assignment.targets[perf.progress.indexOf(false)]*2)-1;
							var piece2 = assignment.targets[perf.progress.indexOf(false)]*2;
							$($("#circle > path").get(piece1-1)).removeClass("transparent");
							$($("#circle > path").get(piece2-1)).removeClass("transparent");
							$($(".progressDot").get(perf.progress.indexOf(false))).attr("stroke", color);
							$("#ballcircle > path").first().attr("fill", color);
	         				window.setTimeout(function(){if(perf.progress.indexOf(false) != 0) $("#progress").attr("fill", color);}, 100);
	         				$("#progress").css("transform", "scale(0)");
	         				$($("#circle > path").get(piece1-1)).attr("fill", color);
							$($("#circle > path").get(piece2-1)).attr("fill", color);
							$("use#use1").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[perf.progress.indexOf(false)]*2)-1)).attr("id"));
							$("use#use2").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[perf.progress.indexOf(false)]*2)-2)).attr("id"));
							if(perf.progress.indexOf(false) < 0){
			        			//done with assignment
								$("#circle > path").attr("fill", "none");
								$("#circle > path").removeClass("transparent");
								perf.finished = Math.round(Date.now()/1000);
								perfs.push(perf);
								$(".progressDot").attr("stroke", "none");
								$(".progressDot").attr("fill", "none");
								
								//save
								//start feedback
								var stringified = JSON.stringify(perfs);
								$("#progress").css("transform", "scale(.5)");
								$("#progress").addClass("loading");
								$.post( "php/save.php", {"userId":user, "perfs":stringified}, function(data) {
									if(data == "success"){
					        			// if(assignment) window.setTimeout(function(){loadAssignment(assignment.id+1);}, 200);
					        			// else window.setTimeout(function(){loadAssignment(null);}, 200);
									}
									else console.log("something went wrong?");
									//console.log("data: "+data);
								});
								window.setTimeout(function(){
									$("#progress").css("transform", "scale(0)");
									$("#progress").removeClass("loading");
									//go to new assignment
									if(assignment) loadAssignment(assignment.id+1);
				        			else loadAssignment(null);
								}, 500);
							}
	        			}
	        		}
	        		else{
	        			//maybe nothing?
	        		}

	        	// }
	        	// else $("#ballcircle").css("opacity", ".25");
	        	$("#cents").html(cents);
	        }
	    },

	    // Debug Callback for visualisation (Optional)
	    onDebug: function(stats, pitchDetector) { },

	    // Minimal signal strength (RMS, Optional)
	    minRms: 0.02,

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

});

function rotate(cents, temperament){
	//destroying the unequal distnces between notes in a scale
	//all notes are equidistant from eachother...!
	var linearDegrees = (cents/options.scale[7])*360.0;
	if(options.temperament == "equal"){
		//$("#ballcircle").css("transform", "rotate("+((cents/1200)*360.0)+"deg)");

		//both offsets together
		//you could also visual offset, then scale offset to avoid some jerkiness?
		if(cents >= (options.scale[0]+options.scale[1])/2 && cents < (options.scale[1]+options.scale[2])/2){
			// console.log("linearDegrees: "+linearDegrees);
			linearDegrees -= 7.5;
			//should be 52
			//$("#ballcircle").css("transform", "rotate("+linearDegrees+"deg)");
		}
		else if(cents >= (options.scale[1]+options.scale[2])/2 && cents < (options.scale[2]+options.scale[3])/2){
			linearDegrees -= 16.5;
		}
		else if(cents >= (options.scale[2]+options.scale[3])/2 && cents < (options.scale[3]+options.scale[4])/2){
			linearDegrees += 4.5;
		}
		else if(cents >= (options.scale[3]+options.scale[4])/2 && cents < (options.scale[4]+options.scale[5])/2){
			linearDegrees -= 4.5;
		}
		else if(cents >= (options.scale[4]+options.scale[5])/2 && cents < (options.scale[5]+options.scale[6])/2){
			linearDegrees -= 13.5;
		}
		else if(cents >= (options.scale[5]+options.scale[6])/2 && cents < (options.scale[6]+options.scale[7])/2){
			linearDegrees -= 22.5;
		}
		else $("#ballcircle").css("transform", "rotate("+((cents/options.scale[7])*360.0)+"deg)");
		$("#ballcircle").css("transform", "rotate("+linearDegrees+"deg)");
	}
	if(options.temperament == "linear"){
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

function playNote(which, duration, when){
	if (!duration) duration = 0.5;
	if(!when) when = audioContext.currentTime;
	// var osc = audioContext.createOscillator();
	// osc.connect(audioContext.destination);
	// // osc.setPeriodicWave(myInstrument);
	// osc.type = 'sawtooth';
	// osc.frequency.value = which*2;
	// osc.start(when);
	// osc.stop(when+duration);
	// console.log("generating: "+which);
	// var osc2 = audioContext.createOscillator();
	// osc2.connect(audioContext.destination);
	// osc2.setPeriodicWave(myInstrument);
	// osc2.frequency.value = which*2;
	// osc2.start();
	// osc2.stop(audioContext.currentTime+0.5);

	// var osc2 = audioContext.createOscillator();
	// osc2.connect(audioContext.destination);
	// // osc2.setPeriodicWave(myInstrument);
	// osc2.type = 'sine';
	// osc2.frequency.value = which;
	// osc2.start(when);
	// osc2.stop(when+duration);

	// var osc3 = audioContext.createOscillator();
	// osc3.connect(audioContext.destination);
	// // osc2.setPeriodicWave(myInstrument);
	// osc3.type = 'square';
	// osc3.frequency.value = which*4;
	// osc3.start(when);
	// osc3.stop(when+duration);

	var osc = audioContext.createOscillator();
	osc.connect(audioContext.destination);
	osc.setPeriodicWave(myInstrument);
	osc.frequency.value = which*2;
	osc.start(when);
	osc.stop(when+duration);
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
	osc2.start(when);
	osc2.stop(when+duration);

	var osc3 = audioContext.createOscillator();
	osc3.connect(audioContext.destination);
	osc3.setPeriodicWave(myInstrument);
	osc3.frequency.value = which*4;
	osc3.start(when);
	osc3.stop(when+duration);
}

function addEventListeners(){
	//this should probably be a for loop...
	$("#one_in, #one_out").removeClass("clickable");
	$("#two_in, #two_out").removeClass("clickable");
	$("#three_in, #three_out").removeClass("clickable");
	$("#four_in, #four_out").removeClass("clickable");
	$("#five_in, #five_out").removeClass("clickable");
	$("#six_in, #six_out").removeClass("clickable");
	$("#seven_in, #seven_out").removeClass("clickable");

	if(assignment.clickable[0] || !assignment){
		$("#one_in, #one_out").on('mousedown', function(e){
			playNote(options.freqs[0]);
		});
		$("#one_in, #one_out").addClass("clickable");
	}
	if(assignment.clickable[1] || !assignment){
		$("#two_in, #two_out").on('mousedown', function(e){
			//console.log("play note 2");
			playNote(options.freqs[1]);
		});
		$("#two_in, #two_out").addClass("clickable");
	}
	if(assignment.clickable[2] || !assignment){
		$("#three_in, #three_out").on('mousedown', function(e){
			playNote(options.freqs[2]);
		});
		$("#three_in, #three_out").addClass("clickable");
	}
	if(assignment.clickable[3] || !assignment){
		$("#four_in, #four_out").on('mousedown', function(e){
			playNote(options.freqs[3]);
		});
		$("#four_in, #four_out").addClass("clickable");
	}
	if(assignment.clickable[4] || !assignment){
		$("#five_in, #five_out").on('mousedown', function(e){
			playNote(options.freqs[4]);
		});
		$("#five_in, #five_out").addClass("clickable");
	}
	if(assignment.clickable[5] || !assignment){
		$("#six_in, #six_out").on('mousedown', function(e){
			playNote(options.freqs[5]);
		});
		$("#six_in, #six_out").addClass("clickable");
	}
	if(assignment.clickable[6] || !assignment){
		$("#seven_in, #seven_out").on('mousedown', function(e){
			playNote(options.freqs[6]);
		});
		$("#seven_in, #seven_out").addClass("clickable");
	}
}

function makeTonic(){
	if(assignment.tonic == undefined && assignment.tonic != "same"){
		var tonic = Math.round(Math.random()*12);
		if(options.A > 219) options.A = options.A/4;
		$("#tonic").html(tonic);
		// freqs[0] = options.A*Math.pow(2, tonic/12);
		// for (var i = 0; i < freqs.length; i++) {
		// 	freqs[i] = options.A*Math.pow(2, (tonic+i)/12);
		// };
		options.freqs = [];
		for (var i = 0; i < options.scale.length-1; i++) {
			options.freqs[i] = options.A*Math.pow(2, ((tonic*100)+options.scale[i])/1200);
			options.colors[i] = (((tonic*100)+options.scale[i])/1200*360)%360;
		};
	}
	else{
		var tonic = 0;
		for (var i = 0; i < options.scale.length-1; i++) {
			options.colors[i] = (((tonic*100)+options.scale[i])/1200*360)%360;
		};
		$("#tonic").html(tonic);
	}
}

function loadAssignment(which){
	//timbre
	if(myInstrument == undefined){
		var instrument = Trombone;
		var real = new Float32Array(instrument.real.length);
		var imag = new Float32Array(instrument.imag.length);
		for (var i = 0; i < instrument.real.length; i++) {
		  real[i] = instrument.real[i];
		  imag[i] = instrument.imag[i];
		}
		myInstrument = audioContext.createPeriodicWave(real, imag);
	}

	$("#circle > path").attr("fill", "none");

	if(!assignAssignmnet(which)){
		if(!localStorage.getItem("didSurvey")) window.location.href = "survey.html";
		//free play
		$("#ballcircle > path").first().attr("fill", "black");
		$("#ballcircle > path").first().attr("stroke", "black");
		$("#circle > path").attr("stroke", "black");
	}
	else{
		//make a new tonic
		makeTonic();
		perf = {
			"systemOptions":options,
			"attempts":[],
			"assignment":which,
			"progress":[],
			"correctFrames":0,
			"started":Math.round(Date.now()/1000),
			"finished":false
		};
		for (var i = assignment.targets.length - 1; i >= 0; i--) {
			perf.progress[i] = false;
		};
		for (var i = assignment.targets.length - 1; i >= 0; i--) {
			perf.attempts[i] = [];
		};

		var color = "hsl("+options.colors[assignment.targets[0]-1]+","+100+"%,"+50+"%)";
		$("#progress").attr("fill", color);
		$("#progress").css("transform", "scale(0)");
		$("#ballcircle > path").first().attr("fill", color);
		$("#circle > path").eq(((assignment.targets[0]-1)*2)).attr("fill", color);
		$("#circle > path").eq(((assignment.targets[0]-1)*2)+1).attr("fill", color);
		$("#circle > path").removeClass("transparent");
		$("use#use1").attr("xlink:href", "#"+$("#circle > path").first().attr("id"));
		$("use#use2").attr("xlink:href", "#"+$($("#circle > path").get(1)).attr("id"));
		$(".progressDot").attr("stroke", "none");
		$(".progressDot").attr("fill", "none");
		//last one is 580, first one is 22
		for (var i = 0; i < assignment.targets.length; i++) {
			if(assignment.targets.length == 1) $(".progressDot").eq(i).attr("cx", 22+((i)*558/(assignment.targets.length))).attr("stroke", "black");
			else $(".progressDot").eq(i).attr("cx", 22+((i)*558/(assignment.targets.length-1))).attr("stroke", "black");
		};
		$($(".progressDot").get(0)).attr("stroke", color);
		updateProgressBar();
		demoAss(assignment.prompt);
	}

	//event listeners
	addEventListeners();
}

function animateAss(delay, j){
	window.setTimeout(function(){$($("#circle > path").get(((assignment.targets[j]*2)-1)-1)).attr("stroke", determineColor(assignment.targets[j]));$("use#use1").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[j]*2)-1)).attr("id"));}, delay);
	window.setTimeout(function(){$($("#circle > path").get(((assignment.targets[j]*2))-1)).attr("stroke", determineColor(assignment.targets[j]));$("use#use2").attr("xlink:href", "#"+$($("#circle > path").get((assignment.targets[j]*2)-2)).attr("id"));}, delay);
}
function deAnimateAss(delay, j){
	window.setTimeout(function(){$($("#circle > path").get(((assignment.targets[j]*2)-1)-1)).attr("stroke", "black");}, delay);
	window.setTimeout(function(){$($("#circle > path").get(((assignment.targets[j]*2))-1)).attr("stroke", "black");}, delay);
}

function demoAss(twe){
	if(twe == "full"){
		var delay = 0;
		for (var i = 0; i < assignment.reqFrames.length; i++) {
			//gotta make sure reqFrames and targets are synchronized
			var duration = assignment.reqFrames[i]*detector.options.length/44100;//seconds of the note
			playNote(options.freqs[assignment.targets[i]-1], duration, audioContext.currentTime+delay);

			animateAss((delay*1000), i);
			delay += duration;
			deAnimateAss((1000*delay), i);
			delay += animationDelay;
		};
	}
	if(twe == "tonic"){
		var duration = assignment.reqFrames[0]*detector.options.length/44100;//seconds of the note
		playNote(options.freqs[0], duration, audioContext.currentTime+delay);
		window.setTimeout(function(){$("#circle > path").eq(0).attr("stroke", determineColor(1));$("use#use1").attr("xlink:href", "#"+$("#circle > path").eq(0).attr("id"));}, 0);
		window.setTimeout(function(){$("#circle > path").eq(1).attr("stroke", determineColor(1));$("use#use2").attr("xlink:href", "#"+$("#circle > path").eq(1).attr("id"));}, 0);

		var duration = assignment.reqFrames[0]*detector.options.length/44100;//seconds of tonic
		window.setTimeout(function(){$("#circle > path").eq(0).attr("stroke", "black");}, 1000*duration);
		window.setTimeout(function(){$("#circle > path").eq(1).attr("stroke", "black");}, 1000*duration);
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

function updateProgressBar(percent){
	// if(!percent){
	// 	var total = assignments.length;
	// 	var completed = getCompletedAssignments();
	// 	var percent = completed.length/total;
	// }
	// //42px angle difference
	// //28.65 - 763.35 = 734.7
	// var change = 734.7/total;
	// $("#angle")[0].points.getItem(1).y = 734.7-90-42+22-(734.7*percent);
	// $("#angle")[0].points.getItem(2).y = 734.7-90+22-(734.7*percent);
	// var color = "hsl("+(percent*360)+","+100+"%,"+50+"%)";
	// $("#angle").attr("fill", color);
	// $("#notAngle").attr("fill", color);

	makeMenu();
}

function determineColor(pie) {
	if(pie > 7) pie = pie%7;
	if(pie == 1) return "hsl("+options.colors[0]+","+100+"%,"+50+"%)";
	if(pie == 2) return "hsl("+options.colors[1]+","+100+"%,"+50+"%)";
	if(pie == 3) return "hsl("+options.colors[2]+","+100+"%,"+50+"%)";
	if(pie == 4) return "hsl("+options.colors[3]+","+100+"%,"+50+"%)";
	if(pie == 5) return "hsl("+options.colors[4]+","+100+"%,"+50+"%)";
	if(pie == 6) return "hsl("+options.colors[5]+","+100+"%,"+50+"%)";
	if(pie == 7) return "hsl("+options.colors[6]+","+100+"%,"+50+"%)";
}

function getCompletedAssignments(){
	var completed = [];
	for (var i = perfs.length - 1; i >= 0; i--) {
		if(perfs[i].progress.indexOf(false) < 0){
			if(completed.indexOf(perfs[i].assignment) < 0){
				completed.push(perfs[i].assignment);
			}
		}
	};
	return completed;
}

function makeMenu(){
	var beginnings = [1, 14, 36, 58, 80, 84, 88, 92, 105, 106]; //start these on a new line
	var completed = getCompletedAssignments();
	completed.sort(function(a, b){return a-b});
	var highestCompleted = 0;
	for (var i = 0; i < completed.length; i++) {
		if(highestCompleted < completed[i]) highestCompleted = completed[i];
	};
	$("#menu").html("");
	var string = '<div class="menuSection"><div id="help"><span>?</span></div></div><div class="menuSection"><h1><a href="consent.html">Consent and Instructions</a></h1></div>';
	for (var i = 0; i < assignments.length; i++) {
		if(beginnings.indexOf(i+1) > -1){
			if(i+1 == 1 || i+1 == beginnings[7]) string += '</div><div class="menuSection"><h1>Benchmark</h1></div><div class="menuSection">';
			else if(i+1 == beginnings[1]) string += '</div><div class="menuSection"><h1>Activities</h1></div><div class="menuSection">';
			else string += '</div><div class="menuSection"><div class="spacer"></div></div><div class="menuSection">';
		}
		if(i < beginnings[1]-1 || i > 90) string += '<div class="menuDot" data-which="'+(i+1)+'""></div>';
		else string += '<div class="menuDot" data-which="'+(i+1)+'""></div>';
	};
	string += '</div>';
	$("#menu").append(string);
	$("#menu").append('<div class="menuSection"><h1><a href="survey.html">Survey</a></h1></div></div>');
	for (var i = 0; i < completed.length; i++) {
		$(".menuDot").eq(completed[i]-1).css("background-color", "hsl( "+($(".menuDot").eq(completed[i]-1).data("which"))/assignments.length*360+",100%,50%)").addClass("clickable");
		// $(".menuDot").eq(i).on("click", {"which":i}, loadAss);
		$(".menuDot").eq(completed[i]-1).on("click",function(event){
			var which = $(event.target).data("which");
			loadAssignment(which);
		});
	};

	// $(".menuDot").eq(assignment.id-1).css("background-color", "hsl( "+(assignment.id)/assignments.length*360+",100%,50%)").addClass("clickable");
	$(".menuDot").eq(assignment.id-1).css("border-color", "hsl( "+(assignment.id)/assignments.length*360+",100%,50%)").addClass("clickable");
	$(".menuDot").eq(assignment.id-1).on("click",function(event){
		var which = $(event.target).data("which");
		loadAssignment(which);
	});

	if(highestCompleted > 0 && highestCompleted+1 != assignment.id){
		$(".menuDot").eq(highestCompleted).css("background-color", "transparent").addClass("clickable");
		$(".menuDot").eq(highestCompleted).css("border-color", "hsl( "+(1+highestCompleted)/assignments.length*360+",100%,50%)");
		$(".menuDot").eq(highestCompleted).on("click", function(){
			loadAssignment(highestCompleted+1);
		});
	}
	$("#help").on("click", function(){
		tour.start();
	});
	// $("#consent").on("click", function(){
	// 		window.location.href = "consent.html";
	// });
	// $("#survey").on("click", function(){
	// 		window.location.href = "survey.html";
	// });
}

// var assignments = [
// 	{
// 		"targets" : [1,2,3,4,5,6,7],
// 		"clickable":[true,true,true,true,true,true,true],
// 		"viz":"scale-full",
// 		"id":1,
// 		"prompt":"full",
// 		"reqFrames":[20,20,20,20,20,20,20],
// 		"color": [0,100,50]
// 	},
// 	{
// 		"targets" : [1,2,3,4,5],
// 		"clickable":[true,false,false,false,false],
// 		"viz":"scale-full",
// 		"id":2,
// 		"prompt":"tonic",
// 		"reqFrames":[40,20,20,20,40],
// 		"color": [310,100,50]
// 	},
// 	{
// 		"targets" : [1,3,5],
// 		"clickable":[true,true,true,true,false],
// 		"viz":"scale-full",
// 		"id":3,
// 		"prompt":"full",
// 		"reqFrames":[20,20,20],
// 		"color": [250,100,50]
// 	},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}
// ];