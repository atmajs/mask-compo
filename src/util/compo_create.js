var compo_create,
	compo_createConstructor;
(function(){
	compo_create = function(arguments_){

		var argLength = arguments_.length,
			Proto = arguments_[argLength - 1],
			Ctor,
			key,
			hasBase;

		if (argLength > 1)
			hasBase = compo_inherit(Proto, _Array_slice.call(arguments_, 0, argLength - 1));

		if (Proto == null)
			Proto = {};

		var include = _resolve_External('include');
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

		compo_meta_prepairAttributesHandler(Proto);
		compo_meta_prepairArgumentsHandler(Proto);

		Ctor = Proto.hasOwnProperty('constructor')
			? Proto.constructor
			: null;

		Ctor = compo_createConstructor(Ctor, Proto, hasBase);

		for(key in CompoProto){
			if (Proto[key] == null)
				Proto[key] = CompoProto[key];
		}

		Ctor.prototype = Proto;
		Proto = null;
		return Ctor;
	};

	compo_createConstructor = function(Ctor, proto, hasBaseAlready) {
		return function CompoBase (node, model, ctx, container, ctr) {

			if (Ctor != null) {
				var overriden = Ctor.call(this, node, model, ctx, container, ctr);
				if (overriden != null)
					return overriden;
			}
			if (hasBaseAlready === true) {
				return;
			}
			if (this.compos != null) {
				this.compos = obj_create(this.compos);
			}
			if (this.pipes != null) {
				Pipes.addController(this);
			}
			if (this.attr != null) {
				this.attr = obj_create(this.attr);
			}
			if (this.scope != null) {
				this.scope = obj_create(this.scope);
			}
		};
	};
}());