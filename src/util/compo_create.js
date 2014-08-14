var compo_create,
	compo_createConstructor;
(function(){
	compo_create = function(arguments_){
		
		var argLength = arguments_.length,
			Proto = arguments_[argLength - 1],
			Ctor,
			key;
		
		if (argLength > 1) 
			compo_inherit(Proto, _Array_slice.call(arguments_, 0, argLength - 1));
		
		if (Proto == null)
			Proto = {};
		
		var include = _resolve_Ref('include');
		if (include != null) 
			Proto.__resource = include.url;
		
		var attr = Proto.attr;
		for (key in Proto.attr) {
			Proto.attr[key] = _mask_ensureTmplFn(Proto.attr[key]);
		}
		
		var slots = Proto.slots;
		for (key in slots) {
			if (typeof slots[key] === 'string'){
				//if DEBUG
				if (is_Function(Proto[slots[key]]) === false)
					log_error('Not a Function @Slot.',slots[key]);
				// endif
				slots[key] = Proto[slots[key]];
			}
		}
		
		compo_meta_prepairAttributeHandler(Proto);
		
		Ctor = Proto.hasOwnProperty('constructor')
			? Proto.constructor
			: function CompoBase() {}
			;
		
		Ctor = compo_createConstructor(Ctor, Proto);

		for(key in CompoProto){
			if (Proto[key] == null)
				Proto[key] = CompoProto[key];
		}

		Ctor.prototype = Proto;
		Proto = null;
		return Ctor;
	};
	
	compo_createConstructor = function(Ctor, proto) {
		var compos = proto.compos,
			pipes = proto.pipes,
			attr = proto.attr;
			
		if (compos == null
			&& pipes == null
			&& proto.attr == null) {
			
			return Ctor;
		}
	
		/* extend compos / attr to keep
		 * original prototyped values untouched
		 */
		return function CompoBase(){
	
			if (compos != null) {
				// use this.compos instead of compos from upper scope
				// : in case compos from proto was extended after
				this.compos = obj_copy(this.compos);
			}
	
			if (pipes != null) 
				Pipes.addController(this);
			
			if (attr != null) 
				this.attr = obj_copy(this.attr);
			
			if (Ctor != null) 
				Ctor.call(this);
			
		};
	};
}());