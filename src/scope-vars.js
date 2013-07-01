var domLib = global.jQuery || global.Zepto || global.$,
	Dom = mask.Dom,
	__array_slice = Array.prototype.slice,
	
	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn;

function _mask_ensureTmplFn(value) {
	if (typeof value !== 'string') {
		return value;
	}
	return _mask_ensureTmplFnOrig(value);
}

if (document != null && domLib == null){
	console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
}
