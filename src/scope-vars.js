var domLib = global.jQuery || global.Zepto || global.$,
	Dom = mask.Dom,
	_array_slice = Array.prototype.slice,
	
	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
	_Class
	
	;

function _mask_ensureTmplFn(value) {
	return typeof value !== 'string'
		? value
		: _mask_ensureTmplFnOrig(value)
		;
}

if (document != null && domLib == null) {
	console.warn('jQuery-Zepto-Kimbo etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
}

_Class = global.Class;

if (_Class == null && typeof exports !== 'undefined') 
	_Class = exports.Class;
