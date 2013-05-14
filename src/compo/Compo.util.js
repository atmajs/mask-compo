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

	if (compo.template) {
		compo.nodes = mask.parse(compo.template);
		return;
	}

	var template = compo.attr.template;

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

	if (typeof template !== 'undefined') {
		compo.nodes = template;

		delete compo.attr.template;
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


function compo_createConstructor(current, proto) {
	var compos = proto.compos,
		pipes = proto.pipes;
	if (compos == null && pipes == null) {
		return current;
	}

	return function CompoBase(){

		if (compos != null) {
			this.compos = obj_copy(compos);
		}

		if (pipes != null) {
			Pipes.addController(this);
		}

		if (typeof current === 'function') {
			current.call(this);
		}
	};
}
