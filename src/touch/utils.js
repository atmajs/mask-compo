var event_bind,
	event_unbind,
	event_trigger,
	isTouchable;

(function(){
	isTouchable = 'ontouchstart' in global;
	
	event_bind = function(el, type, mix) {
		el.addEventListener(type, mix, false);
	};
	event_unbind = function (el, type, mix) {
		el.removeEventListener(type, mix, false);
	};
	event_trigger = function(el, type) {
		var event = new CustomEvent(type, {
			cancelable: true,
			bubbles: true
		});
		el.dispatchEvent(event);
	};
}());
	