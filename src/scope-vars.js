var Dom = mask.Dom,

	_array_slice = Array.prototype.slice,
	_Array_splice = Array.prototype.splice,
	_Array_indexOf = Array.prototype.indexOf,
	
	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
	
	domLib,
	Class	
	;

(function(){
	
	var scope = [global.atma, exports, global];
	
	function resolve() {
		
		var args = arguments,
			j = scope.length,
			
			obj, r, i;
		
		while (--j > -1) {
			obj = scope[j];
			if (obj == null) 
				continue;
			
			i = args.length;
			while (--i > -1){
				r = obj[args[i]];
				if (r != null) 
					return r;
			}
		}
	}
	
	domLib = resolve('jQuery', 'Zepto', '$');
	Class = resolve('Class');
}());

// if DEBUG
if (global.document != null && domLib == null) {
	
	log_warn('jQuery-Zepto-Kimbo etc. was not loaded before MaskJS:Compo, please use Compo.config.setDOMLibrary to define dom engine');
}
// endif

function _mask_ensureTmplFn(value) {
	return typeof value !== 'string'
		? value
		: _mask_ensureTmplFnOrig(value)
		;
}