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

var smoother = [0,0,0,0,0,0,0,0,0,0];

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
	        	// var average = 0;
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
	        		rotate(mode(smoother), options.temperament);
	        		if(assignment && perf.progress.indexOf(false) > -1){
	        			perf.attempts[perf.progress.indexOf(false)].push({"cents":cents, "time":audioContext.currentTime});
	        			if(cents < scale[assignment.targets[perf.progress.indexOf(false)]-1]+slack && cents > scale[assignment.targets[perf.progress.indexOf(false)]-1]-slack){
	        				//console.log("nailed it");
	        				perf.correctFrames++;
	        				$("#radialStop2").attr("stop-opacity", perf.correctFrames/assignment.reqFrames);
	        				$("#radialStop2").attr("offset", 100*perf.correctFrames/assignment.reqFrames+"%");
	        			}
	        			if(perf.correctFrames > assignment.reqFrames){
	        				//victory!
	        				$("."+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]).removeClass("transparent");
	        				perf.progress[perf.progress.indexOf(false)] = true;
	        				perf.correctFrames = 0;
	        				//reset viz
	        				$("#radialStop1").removeClass();
							$("#radialStop2").removeClass();
							$("#radialStop3").removeClass();
							$("#ballcircle > path").first().removeClass();
							$("#ballcircle > path").first().addClass(""+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]);
	        				$("#radialStop1").addClass(""+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]);
							$("#radialStop2").addClass(""+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]);
							$("#radialStop3").addClass(""+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]);
							$("#radialStop2").attr("stop-opacity", 0);
	        				$("#radialStop2").attr("offset", 0);
	        			}
	        		}
	        		else{
	        			//add to local storage
	        		}

	        	}
	        	else $("#ballcircle").css("opacity", ".5");
	        	$("#cents").html(cents);
	        }
	    },

	    // Debug Callback for visualisation (Optional)
	    onDebug: function(stats, pitchDetector) { },

	    // Minimal signal strength (RMS, Optional)
	    minRms: 0.03,

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
	    length: 2048, // default 1024

	    // Limit range (Optional):
	    //minNote: 69, // by MIDI note number
	    //maxNote: 80, 

	    minFrequency: 40,    // by Frequency in Hz
	    maxFrequency: 20000,

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
	var instrument = Chorus_Strings;
	var real = new Float32Array(instrument.real.length);
	var imag = new Float32Array(instrument.imag.length);
	for (var i = 0; i < instrument.real.length; i++) {
	  real[i] = instrument.real[i];
	  imag[i] = instrument.imag[i];
	}
	myInstrument = audioContext.createPeriodicWave(real, imag);

	//start assignment 1
	loadAssignment(1);
});

function rotate(cents, temperament){
	if(temperament == "equal"){
		$("#ballcircle").css("transform", "rotate("+((cents/1200)*360.0)+"deg)");
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
	var osc = audioContext.createOscillator();
	osc.connect(audioContext.destination);
	osc.setPeriodicWave(myInstrument);
	osc.frequency.value = which;
	osc.start();
	osc.stop(audioContext.currentTime+0.5);
	//console.log("generating: "+which);
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
			console.log("play note 2");
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
	$("#tonic").html(tonic);
	freqs[0] = options.A*Math.pow(2, tonic/12);
	for (var i = 0; i < freqs.length; i++) {
		freqs[i] = options.A*Math.pow(2, (tonic+i)/12);
	};
}

function loadAssignment(which){
	if(!which){} //free play
	else if(1){
		//load ass 1
		assignment = {
			"targets" : [1,2,3,4,5,6,7],
			"viz":"scale-full",
			"id":1,
			"prompt":true,
			"reqFrames":20
		};
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
		$("#radialStop1").addClass(""+assignment.viz+"-"+assignment.targets[0]);
		$("#radialStop2").addClass(""+assignment.viz+"-"+assignment.targets[0]);
		$("#radialStop3").addClass(""+assignment.viz+"-"+assignment.targets[0]);
		$("."+assignment.viz+"-"+assignment.targets[perf.progress.indexOf(false)]).addClass("transparent");
		$("#ballcircle > path").first().addClass(""+assignment.viz+"-"+assignment.targets[0]);
	}
}