var Dom = mask.Dom,

	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
	_mask_ensureTmplFn,
	_resolve_External,
	domLib,
	Class	
	;
	
(function(){
	_mask_ensureTmplFn = function(value) {
		return typeof value !== 'string'
			? value
			: _mask_ensureTmplFnOrig(value)
			;
	};
	_resolve_External = function(key){
		return _global[key] || _exports[key] || _atma[key]
	};
	
	var _global = global,
		_atma = global.atma || {},
		_exports = exports || {};
	
	function resolve() {
		var i = arguments.length, val;
		while( --i > -1 ) {
			val = _resolve_External(arguments[i]);
			if (val != null) 
				return val;
		}
		return null;
	}
	domLib = resolve('jQuery', 'Zepto', '$');
	Class = resolve('Class');
}());


// if DEBUG
if (global.document != null && domLib == null) {
	
	log_warn('DomLite is used. You can set jQuery-Zepto-Kimbo via `Compo.config.setDOMLibrary($)`');
}
// endif