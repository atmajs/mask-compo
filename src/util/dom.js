function dom_addEventListener(element, event, listener) {
	
	if (EventDecorator != null) {
		event = EventDecorator(event);
	}
	
	// allows custom events - in x-signal, for example
	if (domLib != null) {
		domLib(element).on(event, listener);
		return;
	}
	
	if (element.addEventListener != null) {
		element.addEventListener(event, listener, false);
		return;
	}
	if (element.attachEvent) {
		element.attachEvent("on" + event, listener);
	}
}
