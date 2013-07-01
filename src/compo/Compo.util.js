function compo_dispose(compo) {
	if (compo.dispose != null) {
		compo.dispose();
	}

	Anchor.removeCompo(compo);

	var i = 0,
		compos = compo.components,
		length = compos && compos.length;

	if (length) {
		for (; i < length; i++) {
			compo_dispose(compos[i]);
		}
	}
}

function compo_ensureTemplate(compo) {
	if (compo.nodes != null) {
		return;
	}
	
	if (compo.attr.template != null) {
		compo.template = compo.attr.template;
		
		delete compo.attr.template;
	}
	
	var template = compo.template;
	
	if (typeof template == null) {
		return;
	}
	

	if (typeof template === 'string') {
		if (template[0] === '#') {
			var node = document.getElementById(template.substring(1));
			if (node == null) {
				console.error('Template holder not found by id:', template);
				return;
			}
			template = node.innerHTML;
		}
		template = mask.parse(template);
	}

	if (typeof template === 'object') {
		compo.nodes = template;
	}
}

function compo_containerArray() {
	var arr = [];
	arr.appendChild = function(child) {
		this.push(child);
	};
	return arr;
}

function compo_attachDisposer(controller, disposer) {

	if (typeof controller.dispose === 'function') {
		var previous = controller.dispose;
		controller.dispose = function(){
			disposer.call(this);
			previous.call(this);
		};

		return;
	}

	controller.dispose = disposer;
}


function compo_createConstructor(ctor, proto) {
	var compos = proto.compos,
		pipes = proto.pipes,
		attr = proto.attr;
		
	if (compos == null && pipes == null && proto.attr == null) {
		return ctor;
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

		if (pipes != null) {
			Pipes.addController(this);
		}
		
		if (attr != null) {
			this.attr = obj_copy(this.attr);
		}

		if (typeof ctor === 'function') {
			ctor.call(this);
		}
	};
}
