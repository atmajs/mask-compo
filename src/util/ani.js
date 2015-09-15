var ani_requestFrame,
	ani_clearFrame,
	ani_updateAttr;

(function(){
	ani_requestFrame = global.requestAnimationFrame;
	ani_clearFrame = global.cancelAnimationFrame;

	ani_updateAttr = function(compo, key, prop, val, meta) {
		var easing = is_Object(meta) ? meta.easing : null;
		if (easing == null) {
			compo.attr[key] = val;
			if (prop != null) {
				compo[prop] = val;
			}
			_refresh();
			return;
		}
		var tweens = compo.__tweens;
		if (tweens == null) {
			tweens = compo.__tweens = new TweenManager(compo);
		}

		var start = compo[prop];
		var end = val;
		tweens.start(key, prop, start, end, easing);
	};


	function _refresh(compo) {
		if (is_Function(compo.onEnterFrame) === false) {
			return;
		}


		if (compo.__frame != null) {
			ani_clearFrame(compo.__frame);
		}
		compo.__frame = ani_requestFrame(compo.onEnterFrame);
	}
}());