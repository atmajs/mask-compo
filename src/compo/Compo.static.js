obj_extend(Compo, {
	create: function(){
		return compo_create(arguments);
	},
	
	createClass: function(){
		
		var Ctor = compo_create(arguments),
			classProto = Ctor.prototype;
		classProto.Construct = Ctor;
		return Class(classProto);
	},
	
	initialize: function(mix, model, ctx, container, parent) {
		if (mix == null)
			throw Error('Undefined is not a component');
		
		if (container == null){
			if (ctx && ctx.nodeType != null){
				container = ctx;
				ctx = null;
			}else if (model && model.nodeType != null){
				container = model;
				model = null;
			}
		}
		var node;
		function createNode(compo) {
			node = {
				controller: compo,
				type: Dom.COMPONENT
			};
		}
		if (typeof mix === 'string'){
			if (/^[^\s]+$/.test(mix)) {
				var compo = mask.getHandler(mix);
				if (compo == null)
					throw Error('Component not found: ' + mix);
				
				createNode(compo);
			} else {
				createNode(Compo({
					template: mix
				}));
			}
		}
		else if (typeof mix === 'function') {
			createNode(mix);
		}
		
		if (parent == null && container != null) {
			parent = Anchor.resolveCompo(container);
		}
		if (parent == null){
			parent = new Compo();
		}
		
		var dom = mask.render(node, model, ctx, null, parent),
			instance = parent.components[parent.components.length - 1];

		if (container != null){
			container.appendChild(dom);
			Compo.signal.emitIn(instance, 'domInsert');
		}
		
		return instance;
	},

	
	find: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
	},
	closest: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	},

	dispose: compo_dispose,
	
	ensureTemplate: compo_ensureTemplate,
	
	attachDisposer: compo_attachDisposer,

	config: {
		selectors: {
			'$': function(compo, selector) {
				var r = domLib_find(compo.$, selector)
				// if DEBUG
				if (r.length === 0) 
					log_warn('<compo-selector> - element not found -', selector, compo);
				// endif
				return r;
			},
			'compo': function(compo, selector) {
				var r = Compo.find(compo, selector);
				// if DEBUG
				if (r == null) 
					log_warn('<compo-selector> - component not found -', selector, compo);
				// endif
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
			if (domLib === lib) 
				return;
			
			domLib = lib;
			domLib_initialize();
		},

		getDOMLibrary: function(){
			return domLib;
		},
		
		eventDecorator: function(mix){
			if (typeof mix === 'function') {
				EventDecorator = mix;
				return;
			}
			if (typeof mix === 'string') {
				console.error('EventDecorators are not used. Touch&Mouse support is already integrated');
				EventDecorator = EventDecos[mix];
				return;
			}
			if (typeof mix === 'boolean' && mix === false) {
				EventDecorator = null;
				return;
			}
		}

	},

	pipe: Pipes.pipe,
	
	resource: function(compo){
		var owner = compo;
		
		while (owner != null) {
			
			if (owner.resource) 
				return owner.resource;
			
			owner = owner.parent;
		}
		
		return include.instance();
	},
	
	plugin: function(source){
		eval(source);
	},
	
	Dom: {
		addEventListener: dom_addEventListener
	}
});

