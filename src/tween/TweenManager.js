var TweenManager = class_create({
	animating: false,
	frame: null,
	constructor: function (compo) {
		this.parent = compo;
		this.tweens = {};
		this.tick = this.tick.bind(this);
		compo_attachDisposer(compo, this.dispose.bind(this));
	},
	start: function(key, prop, start, end, easing){
		// Tween is not disposable, as no resources are held. So if a tween already exists, it will be just overwritten.
		this.tweens[key] = new Tween(key, prop, start, end, easing);
		this.process();
	},
	process: function(){
		if (this.animating) {
			return;
		}
		this.animation = true;
		this.frame = ani_requestFrame(this.tick);
	},
	dispose: function(){
		ani_clearFrame(this.frame);
	},
	tick: function(timestamp){
		var busy = false;
		for (var key in this.tweens) {
			var tween = this.tweens[key];
			if (tween == null) {
				continue;
			}
			tween.tick(timestamp, this.parent);
			if (tween.animating === false) {
				this.tweens[key] = null;
				continue;
			}
			busy = true;
		}
		if (this.parent.onEnterFrame) {
			this.parent.onEnterFrame();
		}
		if (busy) {
			this.frame = ani_requestFrame(this.tick);
			return;
		}
		this.animating = false;
	}
})