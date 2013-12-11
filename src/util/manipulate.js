function node_tryDispose(node){
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
}

function node_tryDisposeChildren(node){
	var child = node.firstChild;
	while(child != null) {
		if (child.nodeType === 1) {
			node_tryDispose(child);
		}
		
		child = child.nextSibling;
	}
}