var event_bind,
	event_unbind,
	event_getCode;
(function(){
	
	event_bind = function (el, type, mix){
		el.addEventListener(type, mix, false);
	};
	event_unbind = function (el, type, mix) {
		el.removeEventListener(type, mix, false);
	};	
	
	event_getCode = function(event){
		var code = event.keyCode || event.which;
		
		if (code >= 96 && code <= 105) {
			// numpad digits
			return code - 48;
		}
		
		return code;
	};
	
}());
