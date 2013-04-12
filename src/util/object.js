function obj_extend(target, source){
	if (target == null){
		target = {};
	}
	if (source == null){
		return target;
	}

	for(var key in source){
		target[key] = source[key];
	}

	return target;
}

function obj_copy(object) {
	var copy = {};

	for (var key in object) {
		copy[key] = object[key];
	}

	return copy;
}
