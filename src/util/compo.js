var compo_dispose,
	compo_detachChild,
	compo_ensureTemplate,
	compo_ensureAttributes,
	compo_attachDisposer,
	compo_removeElements,
	compo_cleanElements,
	compo_prepairAsync,
	compo_errored,

	compo_meta_toAttributeKey,
	compo_meta_prepairAttributesHandler,
	compo_meta_prepairPropertiesHandler,
	compo_meta_prepairArgumentsHandler

	;

(function(){

	compo_dispose = function(compo) {
		if (compo.dispose != null) {
			compo.dispose();
		}

		Anchor.removeCompo(compo);

		var compos = compo.components;
		if (compos != null) {
			var i = compos.length;
			while ( --i > -1 ) {
				compo_dispose(compos[i]);
			}
		}
	};

	compo_detachChild = function(childCompo){
		var parent = childCompo.parent;
		if (parent == null) {
			return;
		}
		var compos = parent.components;
		if (compos == null) {
			return;
		}
		var removed = coll_remove(compos, childCompo);
		if (removed === false) {
			log_warn('<compo:remove> - i`m not in parents collection', childCompo);
		}
	};
	compo_ensureTemplate = function(compo) {
		if (compo.nodes == null) {
			compo.nodes = getTemplateProp_(compo);
			return;
		}
		var behaviour = compo.meta.template;
		if (behaviour == null || behaviour === 'replace') {
			return;
		}
		var template = getTemplateProp_(compo);
		if (template == null) {
			return;
		}
		if (behaviour === 'merge') {
			compo.nodes = mask_merge(template, compo.nodes, compo);
			return;
		}
		if (behaviour === 'join') {
			compo.nodes = [template, compo.nodes];
			return;
		}
		log_error('Invalid meta.nodes behaviour', behaviour);
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
	};
	compo_cleanElements = function (compo) {
		var els = compo.$ || compo.elements;
		if (els == null || els.length === 0) {
			return;
		}
		var x = els[0];
		var parent = compo.parent;
		for (var parent = compo.parent; parent != null; parent = parent.parent) {
			var arr = parent.$ || parent.elements;
			if (arr == null) {
				continue;
			}
			var i = coll_indexOf(arr, x);
			if (i === -1) {
				break;
			}
			arr.splice(i, 1);
			if (els.length > 1) {
				var cursor = 1;
				for (var j = i; j < arr.length; j++) {
					if (arr[j] === els[cursor]) {
						arr.splice(j, 1);
						j--;
						cursor++;
					}
				}
			}
		}
	};

	compo_prepairAsync = function(dfr, compo, ctx){
		var resume = Compo.pause(compo, ctx)
		var x = dfr.then(resume, onError);
		function onError(error) {
			compo_errored(compo, error);
			error_withCompo(error, compo);
			resume();
		}
	};

	compo_errored = function(compo, error){
		var msg = '[%] Failed.'.replace('%', compo.compoName || compo.tagName);
		if (error) {
			var desc = error.message || error.statusText || String(error);
			if (desc) {
				msg += ' ' + desc;
			}
		}
		compo.nodes = reporter_createErrorNode(msg);
		compo.renderEnd = compo.render = compo.renderStart = null;
	};

	// == Meta Attribute and Property Handler
	(function(){

		compo_meta_prepairAttributesHandler = function(Proto){
			var meta = getMetaProp_(Proto);			
			var attributes = meta.attributes;
			if (attributes == null) {
				return;
			}
			var hash = {};
			for(var key in attributes) {
				var val = attributes[key];
				_attr_setProperty_Delegate(Proto, key, val, true, /*out*/ hash);
			}
			meta.readAttributes = _attr_setProperties_Delegate(hash);
		};
		compo_meta_prepairPropertiesHandler = function(Proto){
			var meta = getMetaProp_(Proto);			
			var props = meta.properties;
			if (props == null) {
				return;
			}
			var hash = {};
			for(var key in props) {
				var val = props[key];
				_attr_setProperty_Delegate(Proto, key, val, false, /*out*/ hash);
			}
			meta.readProperties = _attr_setProperties_Delegate(hash);
		};

		compo_meta_toAttributeKey = _getProperty;

		function _attr_setProperties_Delegate(hash){
			return function(compo, attr, model, container){
				for(var key in hash){
					var fn    = hash[key];
					var val   = attr[key];
					var error = fn(compo, key, val, model, container, attr);
					if (error == null) {
						continue;
					}
					_errored(compo, error, key, val)
					return false;
				}
				return true;
			};
		}
		function _attr_setProperty_Delegate(Proto, metaKey, metaVal, isAttr, /*out*/hash) {
			var optional = metaKey.charCodeAt(0) === 63, // ?
				default_ = null,
				attrName = optional
					? metaKey.substring(1)
					: metaKey;

			var property = isAttr ? _getProperty(attrName) : attrName,
				fn = null,
				type = typeof metaVal;
			if ('string' === type) {
				if (metaVal === 'string' || metaVal === 'number' || metaVal === 'boolean') {
					fn = _ensureFns[metaVal];
				} else {
					optional = true;
					default_ = metaVal;
					fn = _ensureFns_Delegate.any();
				}
			}
			else if ('boolean' === type || 'number' === type) {
				optional = true;
				fn = _ensureFns[type];
				default_ = metaVal;
			}
			else if ('function' === type) {
				fn = metaVal;
			}
			else if (metaVal == null) {
				fn = _ensureFns_Delegate.any();
			}
			else if (metaVal instanceof RegExp) {
				fn = _ensureFns_Delegate.regexp(metaVal);
			}
			else if (typeof metaVal === 'object') {
				fn = _ensureFns_Delegate.options(metaVal);
				default_ = metaVal['default'];
				if (default_ !== void 0) {
					optional = true;
				}
			}

			if (fn == null) {
				log_error('Function expected for the attr. handler', metaKey);
				return;
			}

			var factory_ = is_Function(default_) ? default_ : null;
			Proto[property] = null;
			Proto = null;
			hash [attrName] = function(compo, attrName, attrVal, model, container, attr){
				if (attrVal == null) {
					if (optional === false) {
						return Error('Expected');
					}
					if (factory_ != null) {
						compo[property] = factory_.call(compo, model, container, attr);
						return null;
					}
					if (default_ != null) {
						compo[property] = default_;
					}
					return null;
				}

				var val = fn.call(compo, attrVal, model, container, attrName);
				if (val instanceof Error)
					return val;

				compo[property] = val;
				return null;
			};
		}

		function _toCamelCase_Replacer(full, char_){
			return char_.toUpperCase();
		}
		function _getProperty(attrName) {
			var prop = attrName;
			if (prop.charCodeAt(0) !== 120) {
				// x
				prop = 'x-' + prop;
			}
			return prop.replace(/-(\w)/g, _toCamelCase_Replacer)
		}
		function _errored(compo, error, key, val) {
			error.message = compo.compoName + ' - attribute `' + key + '`: ' + error.message;
			compo_errored(compo, error);
			log_error(error.message, '. Current: ', val);
		}
		var _ensureFns = {
			'string': function(x) {
				return typeof x === 'string' ? x : Error('String');
			},
			'number': function(x){
				var num = Number(x);
				return num === num ? num : Error('Number');
			},
			'boolean': function(x, compo, model, attrName){
				if (typeof x === 'boolean')
					return x;
				if (x === attrName)  return true;
				if (x === 'true'  || x === '1') return true;
				if (x === 'false' || x === '0') return false;
				return Error('Boolean');
			}
		};
		var _ensureFns_Delegate = {
			regexp: function(rgx){
				return function(x){
					return rgx.test(x) ? x : Error('RegExp');
				};
			},
			any: function(){
				return function(x){ return x; };
			},
			options: function(opts){
				var type = opts.type,
					def = opts.default || _defaults[type],
					validate = opts.validate,
					transform = opts.transform;
				return function(x, model, container, attrName){
					if (!x) return def;

					if (type != null) {
						var fn = _ensureFns[type];
						if (fn != null) {
							x = fn.apply(this, arguments);
							if (x instanceof Error) {
								return x;
							}
						}
					}
					if (validate != null) {
						var error = validate.call(this, x, model, container);
						if (error) {
							return Error(error);
						}
					}
					if (transform != null) {
						x = transform.call(this, x, model, container);
					}
					return x;
				};
			}
		};
		var _defaults = {
			string: '',
			boolean: false,
			number: 0
		};
	}());

	// == Meta Attribute Handler
	(function(){

		compo_meta_prepairArgumentsHandler = function(Proto){
			var meta = getMetaProp_(Proto);
			var args = meta.arguments;
			if (args != null) {
				var i = args.length;
				while(--i > -1) {
					if (typeof args[i] === 'string') {
						args[i] = { name: args[i], type: null };
					}
				}
				meta.readArguments = _modelArgsBinding_Delegate(args);
			}
		};

		function _modelArgsBinding_Delegate (args) {
			return function(expr, model, ctx, ctr){
				return _modelArgsBinding(args, expr, model, ctx, ctr);				
			};
		}
		function _modelArgsBinding (args, expr, model, ctx, ctr) {
			var arr = null;
			if (expr == null) {
				var i = args.length;
				arr = new Array(i);
				while(--i > -1) {
					arr[i] = expression_eval(args[i].name, model, ctx, ctr);
				}
			} else {
				arr = expression_evalStatements(expr, model, ctx, ctr);
			}
			var out = {},
				arrMax = arr.length,
				argsMax = args.length,
				i = -1;
			while ( ++i < arrMax && i < argsMax ){
				var val = arr[i]
				if (val == null) {
					var type = args[i].type;
					if (type != null) {
						var Type = type;
						if (typeof type === 'string') {
							Type = expression_eval(type, model, ctx, ctr);
							if (Type == null) {
								error_withCompo(type + ' was not resolved', ctr);
							} else {
								val = Di.resolve(Type);
							}
						}
					}
				}
				out[args[i].name] = val;
			}
			return out;
		}

	}());

	function getTemplateProp_(compo){
		var template = compo.template;
		if (template == null) {
			var attr = compo.attr;
			if (attr == null)
				return null;

			template = attr.template;
			if (template == null)
				return null;

			delete compo.attr.template;
		}
		if (typeof template === 'object')
			return template;

		if (is_String(template)) {
			if (template.charCodeAt(0) === 35 && /^#[\w\d_-]+$/.test(template)) {
				// #
				var node = document.getElementById(template.substring(1));
				if (node == null) {
					log_warn('Template not found by id:', template);
					return null;
				}
				template = node.innerHTML;
			}
			return mask.parse(template);
		}
		log_warn('Invalid template', typeof template);
		return null;
	}

	function getMetaProp_(Proto) {
		var meta = Proto.meta;
		if (meta == null) {
			meta = Proto.meta = obj_create(Compo.prototype.meta);
		}
		return meta;
	}
}());
