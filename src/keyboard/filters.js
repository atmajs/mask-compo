var filter_isKeyboardInput,
	filter_skippedInput,
	filter_skippedComponent,
	filter_skippedElement;
(function(){
	filter_skippedInput = function(event, code){
		if (event.ctrlKey || event.altKey) 
			return false;
		return filter_isKeyboardInput(event.target);
	};
	
	filter_skippedComponent = function(compo){
		if (compo.$ == null || compo.$.length === 0) {
			return false;
		}
		return filter_skippedElement(compo.$.get(0));
	};
	filter_skippedElement = function(el) {
		if (document.contains(el) === false) 
			return false;
		
		if (el.style.display === 'none')
			return false;
		
		var disabled = el.disabled;
		if (disabled === true) 
			return false;
		
		return true;
	};
	filter_isKeyboardInput = function (el) {
		var tag = el.tagName;
		if ('TEXTAREA' === tag) {
			return true;
		}
		if ('INPUT' !== tag) {
			return false;
		}
		return TYPELESS_INPUT.indexOf(' ' + el.type + ' ') === -1;
	};
	
	var TYPELESS_INPUT = ' button submit checkbox file hidden image radio range reset ';
}());