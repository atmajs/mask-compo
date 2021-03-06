var Compo, CompoProto, Component;
(function() {

	Compo = function () {
		if (this instanceof Compo){
			// used in Class({Base: Compo})
			return void 0;
		}

		return compo_create(arguments);
	};

	Component = function () {
		if (this.__constructed !== true) {
			this.__constructed = true;
			compo_prepairProperties(this);
		}
		if (this.compos != null) {
			this.compos = obj_create(this.compos);
		}
		if (this.pipes != null) {
			Pipes.addController(this);
		}
		if (this.attr != null) {
			this.attr = obj_create(this.attr);
		}
		if (this.scope != null) {
			this.scope = obj_create(this.scope);
		}
	};
	Compo.create = Component.create = function () {
		return compo_create(arguments);
	};

	// import ./Compo.static.js
	// import ./async.js

	CompoProto = {
		type: Dom.CONTROLLER,
		__constructed: false,
		__resource: null,
		__frame: null,
		__tweens: null,

		ID: null,

		tagName: null,
		compoName: null,
		node: null,
		nodes: null,
		components: null,
		expression: null,
		attr: null,
		model: null,
		scope: null,

		slots: null,
		pipes: null,

		compos: null,
		events: null,
		hotkeys: null,
		async: false,
		await: null,
		resume: null,

		meta: {
			/* render modes, relevant for mask-node */
			mode: null,
			modelMode: null,
			attributes: null,
			properties: null,
			arguments: null,
			template: null,
			serializeNodes: null,
			readAttributes: null,
			readProperties: null,
			readArguments: null
		},

		getAttribute: function(key) {
			var attr = this.meta.attributes;
			if (attr == null || attr[key] === void 0) {
				return this.attr[key];
			}
			var prop = compo_meta_toAttributeKey(key);
			return this[prop];
		},

		setAttribute: function(key, val) {
			var attr = this.meta.attributes;
			var meta = attr == null ? void 0 : attr[key];
			var prop = null;
			if (meta !== void 0) {
				prop = compo_meta_toAttributeKey(key);
			} else {
				var props = this.meta.properties;
				meta = props == null ? void 0 : props[key];
				if (meta !== void 0) {
					prop = key;
				}
			}
			ani_updateAttr(this, key, prop, val, meta);
			if (this.onAttributeSet) {
				this.onAttributeSet(key, val);
			}
		},
		onAttributeSet: null,
		onRenderStart: null,
		onRenderStartClient: null,
		onRenderEnd: null,
		onRenderEndServer: null,
		onEnterFrame: null,
		render: null,
		renderStart: function(model, ctx, container){
			compo_ensureTemplate(this);
			if (is_Function(this.onRenderStart)){
				var x = this.onRenderStart(model, ctx, container);
				if (x !== void 0 && dfr_isBusy(x))
					compo_prepairAsync(x, this, ctx);
			}
		},
		renderStartClient: function(model, ctx, container){
			if (is_Function(this.onRenderStartClient)){
				var x = this.onRenderStartClient(model, ctx, container);
				if (x !== void 0 && dfr_isBusy(x))
					compo_prepairAsync(x, this, ctx);
			}
		},
		renderEnd: function(elements, model, ctx, container){

			Anchor.create(this, elements);

			this.$ = domLib(elements);

			if (this.events != null) {
				Events_.on(this, this.events);
			}
			if (this.compos != null) {
				Children_.select(this, this.compos);
			}
			if (this.hotkeys != null) {
				KeyboardHandler.hotkeys(this, this.hotkeys);
			}
			if (is_Function(this.onRenderEnd)) {
				this.onRenderEnd(elements, model, ctx, container);
			}
			if (is_Function(this.onEnterFrame)) {
				this.onEnterFrame = this.onEnterFrame.bind(this);
				this.onEnterFrame();
			}
		},
		appendTo: function(el) {
			this.$.appendTo(el);
			this.emitIn('domInsert');
			return this;
		},
		append: function(template, model, selector) {
			var parent;

			if (this.$ == null) {
				var ast = is_String(template) ? mask.parse(template) : template;
				var parent = this;
				if (selector) {
					parent = find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
					if (parent == null) {
						log_error('Compo::append: Container not found');
						return this;
					}
				}
				parent.nodes = [parent.nodes, ast];
				return this;
			}

			var frag = mask.render(template, model, null, null, this);
			parent = selector
				? this.$.find(selector)
				: this.$;

			parent.append(frag);
			// @todo do not emit to created compos before
			this.emitIn('domInsert');
			return this;
		},
		find: function(selector){
			return Compo.find(this, selector);
		},
		findAll: function(selector){
			return Compo.findAll(this, selector);
		},
		closest: function(selector){
			return Compo.closest(this, selector);
		},
		on: function() {
			var x = _Array_slice.call(arguments);
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
			compo_cleanElements(this);
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
		emitOut: function(signalName, a1, a2, a3, a4){
			Compo.signal.emitOut(
				this,
				signalName,
				this,
				[a1, a2, a3, a4]
			);
			return this;
		},
		emitIn: function(signalName, a1, a2, a3, a4){
			Compo.signal.emitIn(
				this,
				signalName,
				this,
				[a1, a2, a3, a4]
			);
			return this;
		},
		$scope: function(path){
			return expression_eval('$scope.' + path, null, null, this);
		},
		$eval: function(expr, model, ctx){
			return expression_eval(expr, model || this.model, ctx, this);
		},
		attach: function (name, fn) {
			Compo.attach(this, name, fn);
		},
		serializeState: function () {
			if (this.scope) {
				return { scope: this.scope };
			}			
		},
		deserializeState: function (bundle) {
			if (bundle != null && bundle.scope != null) {
				this.scope = obj_extend(this.scope, bundle.scope);
			}
		}
	};

	Compo.prototype = CompoProto;
	Component.prototype = CompoProto;
}());
