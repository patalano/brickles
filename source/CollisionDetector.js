enyo.kind({
	name: "game.CollisionDetector",
	kind: "enyo.Component",
	published: {
		objects: null
	},
	components: [
		{kind: "Signals", ontick: "tick"}
	],
	create: function() {
		this.inherited(arguments);
	},
	tick: function(inSender, inEvent) {
		this.checkForCollisions();
	},
	objectsChanged: function() {
		this.updateBounds();
	},
	updateBounds: function() {
		var objs = this.getObjects(),
			bounds = null,
			i;
		
		for(i=0, bounds=null;i<objs.length;i++) {
			enyo.mixin(objs[i], objs[i].getBounds());
		}
	},
	checkForCollisions: function() {
		this.updateBounds();
		
		var objs = this.getObjects();
		var collisions = [];
		
		for(var i=0;i<objs.length;i++) {
			
			var outerXBounds = [objs[i].left, objs[i].left + objs[i].width];
			var outerYBounds = [objs[i].top,  objs[i].top + objs[i].height];
			
			for(var j=0;j<objs.length;j++) {
				if(objs[i] === objs[j]) {
					continue;
				}
				
				var innerXBounds = [objs[j].left, objs[j].left + objs[j].width];
				var innerYBounds = [objs[j].top,  objs[j].top + objs[j].height];
				
				var xCollisionSide = (innerXBounds[0] >= outerXBounds[0] && innerXBounds[0] <= outerXBounds[1])
				 	?	"left"
					:	(innerXBounds[1] >= outerXBounds[0] && innerXBounds[1] <= outerXBounds[1])
						?	"right"
						:	false;
				
				var yCollisionSide = (innerYBounds[0] >= outerYBounds[0] && innerYBounds[0] <= outerYBounds[1])
				 	?	"top"
					:	(innerYBounds[1] >= outerYBounds[0] && innerYBounds[1] <= outerYBounds[1])
						?	"bottom"
						:	false;
				
				var xCollisionPoint = (xCollisionSide === "left") ? innerXBounds[0] : (xCollisionSide === "right") ? innerXBounds[1] : null;
				var yCollisionPoint = (yCollisionSide === "top") ? innerYBounds[0] : (yCollisionSide === "bottom") ? innerYBounds[1] : null;
				
				var collisionSide = 
					((yCollisionSide === "top" && objs[i].top + objs[i].height - objs[j].top < 10) || (yCollisionSide === "bottom" && objs[j].top + objs[j].height - objs[i].top < 10))
						?	yCollisionSide
						:	((yCollisionSide === "top" && objs[i].top + objs[i].height - objs[j].top < 10) || (yCollisionSide === "bottom" && objs[j].top + objs[j].height - objs[i].top < 10))
							?	xCollisionSide
							:	null;
				
				if(xCollisionSide && yCollisionSide && collisionSide !== null) {
					collisions.push({
						collidee: objs[j],
						collider: objs[i],
						point: [xCollisionPoint, yCollisionPoint],
						side: collisionSide
					});
				}
			}
		}
		for(var i=0;i<collisions.length;i++) {
			collisions[i].collidee.collision(collisions[i]);
			collisions[i].collider.collision({
				collidee: collisions[i].collider,
				collider: collisions[i].collidee,
				point: collisions[i].point,
				side: (collisions[i].side === "top") ? "bottom" : (collisions[i].side === "bottom") ? "top" : (collisions[i].side === "right") ? "left" : "right"
			});
		}
	}
})