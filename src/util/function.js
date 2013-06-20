function fn_proxy(fn, context) {
	
	return function(){
		return fn.apply(context, arguments);
	};
	
}