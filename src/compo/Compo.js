var Compo, CompoProto;
(function() {

	Compo = function(Proto) {
		if (this instanceof Compo){
			// used in Class({Base: Compo})
			return void 0;
		}
		
		return compo_create(arguments);
	};

	// import Compo.static.js
	// import async.js

	CompoProto = {
		type: Dom.CONTROLLER,
		__resource: null,
		
		tagName: null,
		compoName: null,
		nodes: null,
		components: null,
		attr: null,
		model: null,
		
		slots: null,
		pipes: null,
		
		compos: null,
		events: null,
		
		async: false,
		await: null,
		
		meta: {
			/* render modes, relevant for mask-node */
			mode: null,
			modelMode: null,
			attributes: null,
		},
		
		onRenderStart: null,
		onRenderEnd: null,
		render: null,
		renderStart: function(model, ctx, container){

			if (arguments.length === 1
				&& model != null
				&& model instanceof Array === false
				&& model[0] != null){
				
				var args = arguments[0];
				model = args[0];
				ctx = args[1];
				container = args[2];
			}
				
			if (compo_meta_executeAttributeHandler(this) === false) {
				// errored
				return;
			}
			compo_ensureTemplate(this);
			
			if (is_Function(this.onRenderStart)){
				var x = this.onRenderStart(model, ctx, container);
				if (x !== void 0 && dfr_isBusy(x)) 
					compo_prepairAsync(x, this, ctx);
			}
		},
		renderEnd: function(elements, model, ctx, container){
			if (arguments.length === 1 && elements instanceof Array === false){
				var args = arguments[0];
				elements = args[0];
				model = args[1];
				ctx = args[2];
				container = args[3];
			}

			Anchor.create(this, elements);

			this.$ = domLib(elements);

			if (this.events != null)
				Events_.on(this, this.events);
			
			if (this.compos != null) 
				Children_.select(this, this.compos);
			
			if (is_Function(this.onRenderEnd))
				this.onRenderEnd(elements, model, ctx, container);
		},
		appendTo: function(mix) {
			
			var element = typeof mix === 'string'
				? document.querySelector(mix)
				: mix
				;
			
			if (element == null) {
				log_warn('Compo.appendTo: parent is undefined. Args:', arguments);
				return this;
			}

			var els = this.$,
				i = 0,
				imax = els.length;
			for (; i < imax; i++) {
				element.appendChild(els[i]);
			}

			this.emitIn('domInsert');
			return this;
		},
		append: function(template, model, selector) {
			var parent;

			if (this.$ == null) {
				var dom = typeof template === 'string'
					? mask.compile(template)
					: template;

				parent = selector
					? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'))
					: this;
					
				if (parent.nodes == null) {
					this.nodes = dom;
					return this;
				}

				parent.nodes = [this.nodes, dom];

				return this;
			}
			
			var fragment = mask.render(template, model, null, null, this);

			parent = selector
				? this.$.find(selector)
				: this.$;
				
			
			parent.append(fragment);
			
			
			// @todo do not emit to created compos before
			this.emitIn('domInsert');
			
			return this;
		},
		find: function(selector){
			return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
		},
		closest: function(selector){
			return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'up'));
		},
		on: function() {
			var x = _array_slice.call(arguments);
			if (arguments.length < 3) {
				log_error('Invalid Arguments Exception @use .on(type,selector,fn)');
				return this;
			}

			if (this.$ != null) 
				Events_.on(this, [x]);
			
			if (this.events == null) {
				this.events = [x];
			} else if (is_Array(this.events)) {
				this.events.push(x);
			} else {
				this.events = [x, this.events];
			}
			return this;
		},
		remove: function() {
			compo_removeElements(this);
			compo_detachChild(this);
			compo_dispose(this);

			this.$ = null;
			return this;
		},

		slotState: function(slotName, isActive){
			Compo.slot.toggle(this, slotName, isActive);
			return this;
		},

		signalState: function(signalName, isActive){
			Compo.signal.toggle(this, signalName, isActive);
			return this;
		},

		emitOut: function(signalName /* args */){
			Compo.signal.emitOut(
				this,
				signalName,
				this,
				arguments.length > 1
					? _array_slice.call(arguments, 1)
					: null
			);
			return this;
		},

		emitIn: function(signalName /* args */){
			Compo.signal.emitIn(
				this,
				signalName,
				this,
				arguments.length > 1
					? _array_slice.call(arguments, 1)
					: null
			);
			return this;
		}
	};

	Compo.prototype = CompoProto;
}());
