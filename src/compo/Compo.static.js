obj_extend(Compo, {
	create: function(controller){
		var klass;

		if (controller == null){
			controller = {};
		}

		if (controller.hasOwnProperty('constructor')){
			klass = controller.constructor;
		}

		if (klass == null){
			klass = function CompoBase(){};
		}

		for(var key in Proto){
			if (controller[key] == null){
				controller[key] = Proto[key];
			}
			controller['base_' + key] = Proto[key];
		}


		klass.prototype = controller;


		return klass;
	},

	/* obsolete */
	render: function(compo, model, cntx, container) {

		compo_ensureTemplate(compo);

		var elements = [];

		mask.render(compo.tagName == null ? compo.nodes : compo, model, cntx, container, compo, elements);

		compo.$ = domLib(elements);

		if (compo.events != null) {
			Events_.on(compo, compo.events);
		}
		if (compo.compos != null) {
			Children_.select(compo, compo.compos);
		}

		return compo;
	},

	initialize: function(compo, model, cntx, container, parent) {
		
		var compoName;

		if (container == null){
			if (cntx && cntx.nodeType != null){
				container = cntx;
				cntx = null;
			}else if (model && model.nodeType != null){
				container = model;
				model = null;
			}
		}

		if (typeof compo === 'string'){
			compoName = compo;
			
			compo = mask.getHandler(compoName);
			if (!compo){
				console.error('Compo not found:', compo);
			}
		}

		var node = {
			controller: compo,
			type: Dom.COMPONENT,
			tagName: compoName
		};

		if (parent == null && container != null){
			parent = Anchor.resolveCompo(container);
		}

		if (parent == null){
			parent = new Dom.Component();
		}

		var dom = mask.render(node, model, cntx, null, parent),
			instance = parent.components[parent.components.length - 1];

		if (container != null){
			container.appendChild(dom);

			Compo.signal.emitIn(instance, 'domInsert');
		}

		return instance;
	},

	dispose: function(compo) {
		if (typeof compo.dispose === 'function') {
			compo.dispose();
		}


		var i = 0,
			compos = compo.components,
			length = compos && compos.length;

		if (length) {
			for (; i < length; i++) {
				Compo.dispose(compos[i]);
			}
		}
	},

	find: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
	},
	closest: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	},

	ensureTemplate: compo_ensureTemplate,
	attachDisposer: compo_attachDisposer,

	config: {
		selectors: {
			'$': function(compo, selector) {
				var r = domLib_find(compo.$, selector)
				// if DEBUG
				r.length === 0 && console.error('Compo Selector - element not found -', selector, compo);
				// endif
				return r;
			},
			'compo': function(compo, selector) {
				var r = Compo.find(compo, selector);
				if (r == null) {
					console.error('Compo Selector - component not found -', selector, compo);
				}
				return r;
			}
		},
		/**
		 *	@default, global $ is used
		 *	IDOMLibrary = {
		 *	{fn}(elements) - create dom-elements wrapper,
		 *	on(event, selector, fn) - @see jQuery 'on'
		 *	}
		 */
		setDOMLibrary: function(lib) {
			domLib = lib;
		},


		eventDecorator: function(mix){
			if (typeof mix === 'function') {
				EventDecorator = mix;
				return;
			}
			if (typeof mix === 'string') {
				EventDecorator = EventDecos[mix];
				return;
			}
			if (typeof mix === 'boolean' && mix === false) {
				EventDecorator = null;
				return;
			}
		}

	},

	//pipes: Pipes,
	pipe: Pipes.pipe
});

