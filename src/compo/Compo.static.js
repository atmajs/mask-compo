obj_extend(Compo, {
	create: function(proto){
		var klass;

		if (proto == null){
			proto = {};
		}

		if (proto.hasOwnProperty('constructor')){
			klass = proto.constructor;
		}

		if (klass == null){
			klass = function CompoBase(){};
		}

		for(var key in Proto){
			if (proto[key] == null){
				proto[key] = Proto[key];
			}
		}


		klass.prototype = proto;


		return klass;
	},
	
	createClass: function(classProto){
		
		if (classProto.attr != null) {
			
			for (var key in classProto.attr) {
				classProto.attr[key] = _mask_ensureTmplFn(classProto.attr[key]);
			}
		}
		
		if (hasInclude && global.include) 
			classProto.__resource = global.include.url;
		
		var slots = classProto.slots;
		if (slots != null) {
			for (var key in slots) {
				if (typeof slots[key] === 'string'){
					//if DEBUG
					typeof classProto[slots[key]] !== 'function' && console.error('Not a Function @Slot.',slots[key]);
					// endif
					slots[key] = classProto[slots[key]];
				}
			}
		}
		
		var ctor;
		
		if (classProto.hasOwnProperty('constructor'))
			ctor = classProto.constructor;
		
		if (ctor == null)
			ctor = classProto.Construct;
		
		classProto.Construct = compo_createConstructor(ctor, classProto);
		
		
		var Ext = classProto.Extends;
		if (Ext == null) {
			classProto.Extends = Proto
		} else if (is_Array(Ext)) {
			Ext.unshift(Proto)
		} else {
			classProto.Extends = [Proto, Ext];
		}
		
		return _Class(classProto);
	},

	/* obsolete */
	render: function(compo, model, ctx, container) {

		compo_ensureTemplate(compo);

		var elements = [];

		mask.render(
			compo.tagName == null ? compo.nodes : compo,
			model,
			ctx,
			container,
			compo,
			elements
		);

		compo.$ = domLib(elements);

		if (compo.events != null) 
			Events_.on(compo, compo.events);
		
		if (compo.compos != null) 
			Children_.select(compo, compo.compos);
		
		return compo;
	},

	initialize: function(compo, model, ctx, container, parent) {
		
		var compoName;

		if (container == null){
			if (ctx && ctx.nodeType != null){
				container = ctx;
				ctx = null;
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

		if (parent == null && container != null)
			parent = Anchor.resolveCompo(container);
		
		if (parent == null)
			parent = new Dom.Component();
		

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
	
	attachDisposer: compo_attachDisposer,

	ensureTemplate: compo_ensureTemplate,
	
	attachDisposer: compo_attachDisposer,

	config: {
		selectors: {
			'$': function(compo, selector) {
				var r = domLib_find(compo.$, selector)
				// if DEBUG
				if (r.length === 0) 
					console.error('<compo-selector> - element not found -', selector, compo);
				// endif
				return r;
			},
			'compo': function(compo, selector) {
				var r = Compo.find(compo, selector);
				// if DEBUG
				if (r == null) 
					console.error('<compo-selector> - component not found -', selector, compo);
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

