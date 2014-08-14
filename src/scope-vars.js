var Dom = mask.Dom,

	_array_slice = Array.prototype.slice,
	_Array_slice = Array.prototype.slice,
	_Array_splice = Array.prototype.splice,
	_Array_indexOf = Array.prototype.indexOf,
	
	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
	_mask_ensureTmplFn,
	_resolve_Ref,
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
	_resolve_Ref = function(key){
		return _global[key] || _exports[key] || _atma[key]
	};
	
	var _global = global,
		_atma = global.atma || {},
		_exports = exports || {};
	
	function resolve() {
		var i = arguments.length, val;
		while( --i > -1 ) {
			val = _resolve_Ref(arguments[i]);
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
	
	log_warn('jQuery-Zepto-Kimbo etc. was not loaded before MaskJS:Compo, please use Compo.config.setDOMLibrary to define dom engine');
}
// endif