var domLib = global.jQuery || global.Zepto || global.$,
	Dom = mask.Dom;

if (!domLib){
	console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
}
