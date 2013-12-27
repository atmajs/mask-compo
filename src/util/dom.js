var dom_addEventListener,
	
	node_tryDispose,
	node_tryDisposeChildren
	;
	
(function(){

	dom_addEventListener = function(element, event, listener) {
	
		if (EventDecorator != null) 
			event = EventDecorator(event);
		
		// allows custom events - in x-signal, for example
		if (domLib != null) 
			return domLib(element).on(event, listener);
			
		
		if (element.addEventListener != null) 
			return element.addEventListener(event, listener, false);
		
		if (element.attachEvent) 
			element.attachEvent('on' + event, listener);
		
	};

	node_tryDispose = function(node){
		if (node.hasAttribute('x-compo-id')) {
			
			var id = node.getAttribute('x-compo-id'),
				compo = Anchor.getByID(id)
				;
			
			if (compo) {
				compo_dispose(compo);
				compo_detachChild(compo);
			}
			return;
		}
		
		node_tryDisposeChildren(node);
	};
	
	node_tryDisposeChildren = function(node){
		
		var child = node.firstChild;
		while(child != null) {
			
			if (child.nodeType === 1) 
				node_tryDispose(child);
			
			
			child = child.nextSibling;
		}
	};
	
}());
