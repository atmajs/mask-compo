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
	findAll: function(compo, selector) {
		return find_findAll(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
	},
	closest: function(compo, selector){
		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	},
	children: function(compo, selector){
		return find_findChildren(compo, selector_parse(selector, Dom.CONTROLLER));
	},
	child: function(compo, selector){
		return find_findChild(compo, selector_parse(selector, Dom.CONTROLLER));
	},

	dispose: compo_dispose,

	ensureTemplate: compo_ensureTemplate,

	attachDisposer: compo_attachDisposer,

	attach: function (compo, name, fn) {
		var current = obj_getProperty(compo, name);		
		if (is_Function(current)) {
			var wrapper = function(){
				var args = _Array_slice.call(arguments);
				fn.apply(compo, args);
				current.apply(compo, args);
			};
			obj_setProperty(compo, name, wrapper);
			return;
		}
		if (current == null) {
			obj_setProperty(compo, name, fn);
			return;
		}
		throw Error('Cann`t attach ' + name + ' to not a Function');
	},

	gc: {
		using: function (compo, x) {
			if (x.dispose == null) {
				console.warn('Expects `disposable` instance');
				return x;
			}
			Compo.attach(compo, 'dispose', function(){
				x && x.dispose();
				x = null;
			});
		},
		on: function (compo, emitter, /* ...args */) {
			var args = _Array_slice.call(arguments, 2);
			var fn = emitter.on || emitter.addListener || emitter.addEventListener || emitter.bind;
			var fin = emitter.off || emitter.removeListener || emitter.removeEventListener || emitter.unbind;
			if (fn == null || fin === null) {
				console.warn('Expects `emitter` instance with any of the methods: on, addListener, addEventListener, bind');
				return;
			}
			fn.apply(emitter, args);
			Compo.attach(compo, 'dispose', function(){
				emitter && fin.apply(emitter, args);
				emitter = null;
			});
		},
		subscribe: function(compo, observable /* ...args */){
			var args = _Array_slice.call(arguments, 2);
			if (observable.subscribe == null) {
				console.warn('Expects `IObservable` instance with subscribe/unsubscribe methods');
				return;
			}
			var result = observable.apply(observable, args);
			if (observable.unsubscribe == null && (result == null || result.dispose == null)) {
				throw Error('Invalid subscription: don`t know how to unsubscribe');
				return;
			}
			Compo.attach(compo, 'dispose', function(){
				if (observable == null) {
					return;
				}
				if (result && result.dispose) {
					result.dispose();
					result = null;
					observable = null;
					return;
				}
				if (observable.unsubscribe) {
					observable.unsubscribe(args[0]);
					observable = null;					
					result = null;
				}				
			});
		}
	},

	element: {
		getCompo: function (el) {
			return Anchor.resolveCompo(el, true);
		},
		getModel: function (el) {
			var compo = Anchor.resolveCompo(el, true);
			if (compo == null) return null;
			var model = compo.model;
			while (model == null && compo.parent != null) {
				compo = compo.parent;
				model = compo.model;
			}
			return model;
		},
	},
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
		// if DEBUG
		eval(source);
		// endif
	},

	Dom: {
		addEventListener: dom_addEventListener
	}
});
