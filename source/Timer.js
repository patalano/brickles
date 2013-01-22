enyo.kind({
	name: "game.Timer",
	kind: "enyo.Component",
	published: {
		running: false,
		startTime: null,
		timeElapsed: null
	},
	//* @protected
	interval: null,
	intervalMS: 20,
	create: function() {
		this.inherited(arguments);
	},
	runningChanged: function() {
		this.inherited(arguments);
		if(!this.getStartTime()) {
			this.setStartTime(enyo.now());
		}
		if(this.getRunning()) {
			this.startTicker();
		} else {
			this.stopTicker();
		}
	},
	startTicker: function() {
		this.interval = setInterval(enyo.bind(this,this.tick), this.intervalMS);
	},
	stopTicker: function() {
		if(this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	},
	tick: function() {
		var st = this.getStartTime(),
			e = enyo.now() - st;
		
		enyo.Signals.send(
				"ontick",
				{
					startTime: st,
					elapsedTime: e
				}
		);
		
		this.setTimeElapsed(e);
	},
	
	//* @public
	start: function() { this.setRunning(true); },
	stop: function() { this.setRunning(false); }
});