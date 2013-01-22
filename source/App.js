enyo.kind({
	name: "App",
	components: [
		{name: "timer", kind: "game.Timer"},
		{name: "collisionDetector", kind: "game.CollisionDetector"},
		{name: "container", classes: "container", components: [
			{name: "paddle", kind: "Paddle", },
			{name: "ball", kind: "Ball", onHitBottom: "lose"}
		]},
		{name: "popup", kind: "onyx.Popup", centered: true, floating: true, showing: false, scrim: true, classes:"onyx-sample-popup", style: "padding: 20px;"}
	],
	handlers: {
		onBrickDestroyed: "brickDestroyed"
	},
	brickWidth: 100,
	brickHeight: 20,
	brickMargin: 2,
	numBricks: 27,
	bricksPerRow: 9,
	initBrickTop: 50,
	initBrickLeft: 50,
	rendered: function() {
		this.inherited(arguments);
		this.setPaddleBounds();
		this.setBallBounds();
		this.createBricks();
		this.setCollisionObjects();
		this.$.timer.start();
	},
	setPaddleBounds: function() {
		this.$.paddle.setMinLeft(0);
		this.$.paddle.setMaxLeft(this.$.container.getBounds().width - this.$.paddle.getBounds().width);
	},
	setBallBounds: function() {
		var containerBounds = this.$.container.getBounds(),
			ballBounds = this.$.ball.getBounds();
		
		this.$.ball.setMinLeft(0);
		this.$.ball.setMaxLeft(containerBounds.width - ballBounds.width);
		this.$.ball.setMinTop(0);
		this.$.ball.setMaxTop(containerBounds.height);
	},
	setCollisionObjects: function() {
		var controls = this.$.container.getClientControls();
		this.$.collisionDetector.setObjects(controls);
	},
	createBricks: function() {
		var top = this.initBrickTop,
			left = this.initBrickLeft,
			i;
		
		for(i=0;i<this.numBricks;i++) {
			if(i%this.bricksPerRow == 0 && i > 0) {
				top += this.brickHeight+this.brickMargin;
				left = this.initBrickLeft;
			} else if (i > 0) {
				left += this.brickWidth+this.brickMargin;
			}
			
			this.$.container.createComponent({kind: "Brick", style: "top:"+top+"px;left:"+left+"px;"}).render();
		}
	},
	brickDestroyed: function() {
		var controls = this.$.container.getClientControls(),
			numBricks = 0;
		
		for(var i=0;i<controls.length;i++) {
			if(controls[i].kind === "Brick") {
				numBricks++;
			}
		}
		
		// Event is fired before control is destroyed, so countdown to 1 rather than 0
		if(numBricks === 1) {
			this.win();
		}
	},
	lose: function() {
		this.$.timer.stop();
		this.$.popup.setContent("You Lose!");
		this.$.popup.setShowing(true);
	},
	win: function() {
		this.$.timer.stop();
		this.$.popup.setContent("You Win!");
		this.$.popup.setShowing(true);
	},
});

enyo.kind({
	name: "Brick",
	kind: "game.GameObject",
	classes: "brick",
	events: {
		onBrickDestroyed: ""
	},
	components: [
		{kind: "Signals", ontick: "tick"}
	],
	collision: function(inEvent) {
		if(inEvent.collider.kind === "Ball") {
			this.doBrickDestroyed();
			this.destroy();
		}
	}
});

enyo.kind({
	name: "Paddle",
	kind: "game.GameObject",
	classes: "paddle",
	published: {
		minLeft: 0,
		maxLeft: 0,
		left: 300
	},
	leftIncrement: 30,
	moving: 0,
	components: [
		{kind: "Signals", onkeydown: "keydown", onkeyup: "keyup", ontick: "tick"}
	],
	keydown: function(inSender, inEvent) {
		if(inEvent.keyCode === 37) {
			this.startLeft();
			return true;
		} else if(inEvent.keyCode === 39) {
			this.startRight();
			return true;
		}
	},
	keyup: function(inSender, inEvent) {
		if(this.moving) {
			this.stopMoving();
		}
	},
	tick: function(inSender, inEvent) {
		if(this.moving === -1) {
			this.goLeft();
		} else if(this.moving === 1) {
			this.goRight();
		}
	},
	
	startLeft: function() { this.moving = -1; },
	startRight: function() { this.moving = 1; },
	stopMoving: function() { this.moving = 0; },
	
	goLeft: function() { this.setLeft(this.clamp(this.getLeft()-this.leftIncrement)); },
	goRight: function() { this.setLeft(this.clamp(this.getLeft()+this.leftIncrement)); },
	
	leftChanged: function() { this.applyStyle("left",this.getLeft()+"px"); },
	
	clamp: function(val) {
		var max = this.getMaxLeft(),
			min = this.getMinLeft();
		
		return (val <= min) ? min : (val >= max) ? max : val;
	}
});

enyo.kind({
	name: "Ball",
	kind: "game.GameObject",
	published: {
		top: 100,
		minTop: 0,
		maxTop: 0,
		left: 100,
		minLeft: 0,
		maxLeft: 0,
		speed: 5
	},
	events: {
		onHitBottom: ""
	},
	classes: "ball",
	dx: 0.3,
	dy: 2,
	angleBounceAmount: 0.5,
	components: [
		{kind: "Signals", ontick: "tick"}
	],
	tick: function() {
		this.move();
	},
	move: function() {
		var speed = this.getSpeed(),
			left = this.getLeft(),
			top = this.getTop(),
			newLeft = left,
			newTop = top;
		
		this.checkForContainerBounce();
		
		newLeft = left + speed*this.dx,
		newTop = top + speed*this.dy;
		
		this.setLeft(this.clampLeft(newLeft));
		this.setTop(this.clampTop(newTop));
	},
	
	leftChanged: function() { this.applyStyle("left",this.getLeft()+"px"); },
	topChanged: function() { this.applyStyle("top",this.getTop()+"px"); },
	
	clampLeft: function(val) {
		var max = this.getMaxLeft(),
			min = this.getMinLeft();
		
		return (val <= min) ? min : (val >= max) ? max : val;
	},
	clampTop: function(val) {
		var max = this.getMaxTop(),
			min = this.getMinTop();
		return val;
		return (val <= min) ? min : (val >= max) ? max : val;
	},
	
	checkForContainerBounce: function() {
		var left = this.getLeft(),
			top = this.getTop(),
			collisionSide = 
				(left <= this.getMinLeft()) ? "left" :
				(left >= this.getMaxLeft()) ? "right" :
				(top <= this.getMinTop()) ? "top" :
				(top + this.getBounds().height >= this.getMaxTop()) ? "bottom" : false;
		
		if(collisionSide) {
			if(collisionSide === "bottom") {
				this.doHitBottom();
			}
			this.bounce(collisionSide);
		}
	},
	
	collision: function(inEvent) {
		if(inEvent.collider.kind === "Paddle") {
			this.angleBounce(inEvent.collider);
			this.bounce(inEvent.side);
		} else if(inEvent.collider.kind === "Brick") {
			this.bounce(inEvent.side);
		}
	},
	
	angleBounce: function(inCollider) {
		var ballCenterPoint = this.left + this.width/2,
			paddleCenterPoint = inCollider.left + inCollider.width/2,
			diff = ballCenterPoint - paddleCenterPoint;
		
		if(diff < -1*inCollider.width/3) {
			this.dx -= this.angleBounceAmount;
		} else if(diff > inCollider.width/3) {
			this.dx += this.angleBounceAmount;
		}
	},
	
	bounce: function(inSide) {
		switch(inSide) {
			case "bottom":
				this.dy = -1*Math.abs(this.dy);
				break;
			case "top":
				this.dy = Math.abs(this.dy);
				break;
			case "right":
				this.dx = -1*Math.abs(this.dx);
				break;
			case "left":
				this.dx = Math.abs(this.dx);
				break;
		}
	}
});