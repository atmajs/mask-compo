function slots_mix(target, source) {
	for (var key in source) {
		
		if (target.hasOwnProperty(key) === false) {
			target[key] = source[key];
			continue;
		}
		
		target[key] = slot_inherit(handler, source[key]);
		
		
	}
}


function slot_inherit(handler, base) {
	// is called then in controllers context
	return function(){
		
		this.super = base;
		
		return handler.apply(this, arguments);
	};
}