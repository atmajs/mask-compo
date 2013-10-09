function fn_proxy(fn, context) {
	
	return function(){
		return fn.apply(context, arguments);
	};
	
}

function fn_isFunction(fn){
	return typeof fn === 'function';
}