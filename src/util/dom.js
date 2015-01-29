var dom_addEventListener,
	
	node_tryDispose,
	node_tryDisposeChildren
	;
	
(function(){

	dom_addEventListener = function(el, event, fn, param, ctr) {
	
		if (TouchHandler.supports(event)) {
			TouchHandler.on(el, event, fn);
			return;
		}
		if (KeyboardHandler.supports(event, param)) {
			KeyboardHandler.attach(el, event, param, fn, ctr);
			return;
		}
		// allows custom events - in x-signal, for example
		if (domLib != null) 
			return domLib(el).on(event, fn);
		
		if (el.addEventListener != null) 
			return el.addEventListener(event, fn, false);
		
		if (el.attachEvent) 
			el.attachEvent('on' + event, fn);
	};

	node_tryDispose = function(node){
		if (node.hasAttribute('x-compo-id')) {
			
			var id = node.getAttribute('x-compo-id'),
				compo = Anchor.getByID(id)
				;
			
			if (compo != null) {
				if (compo.$ == null || compo.$.length === 1) {
					compo_dispose(compo);
					compo_detachChild(compo);
					return;
				}
				var i = _Array_indexOf.call(compo.$, node);
				if (i !== -1) 
					_Array_splice.call(compo.$, i, 1);
			}
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
