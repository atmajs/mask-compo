var domLib = global.jQuery || global.Zepto || global.$,
	Dom = mask.Dom,
	__array_slice = Array.prototype.slice;

if (document != null && domLib == null){
	console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
}
