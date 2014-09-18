var obj_extend,
	obj_copy
	;
(function(){
	
	
	obj_extend = function(target, source){
		if (target == null)
			target = {};
		
		if (source == null)
			return target;
		
		for(var key in source){
			target[key] = source[key];
		}
	
		return target;
	};
	
	obj_copy = Object.create || function(object) {
		var copy = {}, key;
		for (key in object) {
			copy[key] = object[key];
		}
		return copy;
	};
}());
