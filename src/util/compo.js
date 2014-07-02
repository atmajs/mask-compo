var compo_dispose,
	compo_detachChild,
	compo_ensureTemplate,
	compo_attachDisposer,
	compo_createConstructor,
	compo_removeElements
	;

(function(){
	
	compo_dispose = function(compo) {
		
		if (compo.dispose != null) 
			compo.dispose();
		
		Anchor.removeCompo(compo);
	
		var compos = compo.components,
			i = (compos && compos.length) || 0;
	
		while ( --i > -1 ) {
			compo_dispose(compos[i]);
		}
	};
	
	compo_detachChild = function(childCompo){
		
		var parent = childCompo.parent;
		if (parent == null) 
			return;
		
		var arr = childCompo.$,
			elements = parent.$ || parent.elements,
			i;
			
		if (elements && arr) {
			var jmax = arr.length,
				el, j;
			
			i = elements.length;
			while( --i > -1){
				el = elements[i];
				j = jmax;
				
				while(--j > -1){
					if (el === arr[j]) {
						
						elements.splice(i, 1);
						break;
					}
				}
			}
		}
		
		var compos = parent.components;
		if (compos != null) {
			
			i = compos.length;
			while(--i > -1){
				if (compos[i] === childCompo) {
					compos.splice(i, 1);
					break;
				}
			}
	
			if (i === -1)
				console.warn('<compo:remove> - i`m not in parents collection', childCompo);
		}
	};
	
	
	
	compo_ensureTemplate = function(compo) {
		if (compo.nodes != null) 
			return;
		
		// obsolete
		if (compo.attr.template != null) {
			compo.template = compo.attr.template;
			
			delete compo.attr.template;
		}
		
		var template = compo.template;
		if (template == null) 
			return;
		
		if (is_String(template)) {
			if (template.charCodeAt(0) === 35 && /^#[\w\d_-]+$/.test(template)) {
				// #
				var node = document.getElementById(template.substring(1));
				if (node == null) {
					console.error('<compo> Template holder not found by id:', template);
					return;
				}
				template = node.innerHTML;
			}
			
			template = mask.parse(template);
		}
	
		if (typeof template === 'object') 
			compo.nodes = template;
	};
	
		
	compo_attachDisposer = function(compo, disposer) {
	
		if (compo.dispose == null) {
			compo.dispose = disposer;
			return;
		}
		
		var prev = compo.dispose;
		compo.dispose = function(){
			disposer.call(this);
			prev.call(this);
		};
	};
	
		
	
	compo_createConstructor = function(Ctor, proto) {
		var compos = proto.compos,
			pipes = proto.pipes,
			attr = proto.attr;
			
		if (compos == null
				&& pipes == null
				&& proto.attr == null) {
			
			return Ctor;
		}
	
		/* extend compos / attr to keep
		 * original prototyped values untouched
		 */
		return function CompoBase(){
	
			if (compos != null) {
				// use this.compos instead of compos from upper scope
				// : in case compos from proto was extended after
				this.compos = obj_copy(this.compos);
			}
	
			if (pipes != null) 
				Pipes.addController(this);
			
			if (attr != null) 
				this.attr = obj_copy(this.attr);
			
			if (is_Function(Ctor)) 
				Ctor.call(this);
		};
	};
	
	compo_removeElements = function(compo) {
		if (compo.$) {
			compo.$.remove();
			return;
		}
		
		var els = compo.elements;
		if (els) {
			var i = -1,
				imax = els.length;
			while ( ++i < imax ) {
				if (els[i].parentNode) 
					els[i].parentNode.removeChild(els[i]);
			}
			return;
		}
		
		var compos = compo.components;
		if (compos) {
			var i = -1,
				imax = compos.length;
			while ( ++i < imax ){
				compo_removeElements(compos[i]);
			}
		}
	}

	
}());
