var compo_inherit;
(function(){
	
	compo_inherit = function(Proto, Extends){
		
		var imax = Extends.length,
			i = imax,
			ctors = [],
			x;
		while( --i > -1){
			x = Extends[i];
			if (typeof x === 'string') 
				x = Mask.getHandler(x);
			if (x == null) {
				log_error('Base component not defined', Extends[i]);
				continue;
			}
			if (typeof x === 'function') {
				ctors.push(x);
				x = x.prototype;
			}
			
			inherit_(Proto, x);
		}
		
		i = -1;
		imax = ctors.length;
		if (imax > 0) {
			if (Proto.hasOwnProperty('constructor')) 
				ctors.unshift(Proto.constructor);
			
			Proto.constructor = joinFns_(ctors);
			
		}
	};
	
	function inherit_(target, source){
		var mix, type;
		for(var key in source){
			mix = source[key];
			if (mix == null || key === 'constructor')
				continue;
			
			type = typeof mix;
			
			if (target[key] == null) {
				target[key] = 'object' === type
					? clone_(mix)
					: mix;
				continue;
			}
			
			if ('function' === type) {
				target[key] = createWrapper_(target[key], mix);
				continue;
			}
			if ('object' !== type) {
				// value properties are not extended
				continue;
			}
			
			switch(key){
				case 'slots':
				case 'pipes':
				case 'events':
				case 'attr':
					inherit_(target[key], mix);
					continue;
				case 'nodes':
					target.nodes = mix;
					continue;
			}
			defaults_(target[key], mix);
		}
		
		if (target.super != null) 
			log_error('`super` property is reserved. Dismissed. Current prototype', target);
		target.super = null;
	}
	
	/*! Circular references are not handled */
	function clone_(a) {
		if (a == null) 
			return null;
		
		if (typeof a !== 'object') 
			return a;
		
		if (is_Array(a)) {
			var imax = a.length,
				i = -1,
				arr = new Array(imax)
				;
			while( ++i < imax ){
				arr[i] = clone_(a[i]);
			}
			return arr;
		}
		
		var object = {};
		for(var key in a){
			object[key] = clone_(a[key]);
		}
		return object;
	}
	function defaults_(target, source){
		var targetV, sourceV, key;
		for(var key in source){
			targetV = target[key];
			sourceV = source[key];
			if (targetV == null) {
				target[key] = sourceV;
				continue;
			}
			if (is_rawObject(targetV) && is_rawObject(sourceV)){
				defaults_(targetV, sourceV);
				continue;
			}
		}
	}
	function createWrapper_(selfFn, baseFn){
		if (selfFn.name === 'compoInheritanceWrapper') {
			selfFn._fn_chain.push(baseFn);
			return selfFn;
		}
		
		function compoInheritanceWrapper(){
			var fn = x._fn || (x._fn = compileFns_(x._fn_chain));
			return fn.apply(this, arguments);
		}
		
		var x = compoInheritanceWrapper;
		x._fn_chain = [ selfFn, baseFn ];
		x._fn = null;
		
		return x;
	}
	function compileFns_(fns){
		var i = fns.length,
			fn = fns[ --i ];
		while( --i > -1){
			fn = inheritFn_(fns[i], fn);
		}
		return fn;
	}
	function inheritFn_(selfFn, baseFn){
		return function(){
			this.super = baseFn;
			var x = fn_apply(selfFn, this, arguments);
			
			this.super = null;
			return x;
		};
	}
	function joinFns_(fns) {
		var imax = fns.length;
		return function(){
			var i = imax;
			while( --i > -1 ){
				fns[i].apply(this, arguments);
			}
		};
	}
}());