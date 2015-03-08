// source /src/umd-head.js
(function (root, factory) {
    'use strict';

    if (root == null && typeof global !== 'undefined'){
        root = global;
    }
    var exports_ = (typeof exports !== 'undefined' && exports) || {};

    var construct = function(){
            return factory(root, mask, exports_);
        };

    if (typeof exports === 'object') {
        module.exports = construct();
    } else if (typeof define === 'function' && define.amd) {
        define(construct);
    } else {
        root.Compo = construct();
    }
}(this, function (global, mask, exports) {
    'use strict';

// end:source /src/umd-head.js
	
	var log_warn = console.warn.bind(console);
	var log_error = console.error.bind(console);
	var obj_extend = mask.obj.extend;
	var class_create = mask.class.create;
	
	var is_Function = mask.is.Function;
	var is_Array 	= mask.is.ArrayLike;
	var is_String 	= mask.is.String;
	
	// source /src/scope-vars.js
	var Dom = mask.Dom,
	
		_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
		_mask_ensureTmplFn,
		_resolve_External,
		domLib,
		Class	
		;
		
	(function(){
		_mask_ensureTmplFn = function(value) {
			return typeof value !== 'string'
				? value
				: _mask_ensureTmplFnOrig(value)
				;
		};
		_resolve_External = function(key){
			return _global[key] || _exports[key] || _atma[key]
		};
		
		var _global = global,
			_atma = global.atma || {},
			_exports = exports || {};
		
		function resolve() {
			var i = arguments.length, val;
			while( --i > -1 ) {
				val = _resolve_External(arguments[i]);
				if (val != null) 
					return val;
			}
			return null;
		}
		domLib = resolve('jQuery', 'Zepto', '$');
		Class = resolve('Class');
	}());
	
	
	// if DEBUG
	if (global.document != null && domLib == null) {
		
		log_warn('DomLite is used. You can set jQuery-Zepto-Kimbo via `Compo.config.setDOMLibrary($)`');
	}
	// endif
	// end:source /src/scope-vars.js

	// source /src/util/exports.js
	// source ./selector.js
	var selector_parse,
		selector_match
		;
	
	(function(){
		
		selector_parse = function(selector, type, direction) {
			if (selector == null)
				log_error('<compo>selector is undefined', type);
			
			if (typeof selector === 'object')
				return selector;
			
		
			var key, prop, nextKey;
		
			if (key == null) {
				switch (selector[0]) {
				case '#':
					key = 'id';
					selector = selector.substring(1);
					prop = 'attr';
					break;
				case '.':
					key = 'class';
					selector = sel_hasClassDelegate(selector.substring(1));
					prop = 'attr';
					break;
				default:
					key = type === Dom.SET ? 'tagName' : 'compoName';
					break;
				}
			}
		
			if (direction === 'up') {
				nextKey = 'parent';
			} else {
				nextKey = type === Dom.SET ? 'nodes' : 'components';
			}
		
			return {
				key: key,
				prop: prop,
				selector: selector,
				nextKey: nextKey
			};
		};
		
		selector_match = function(node, selector, type) {
			if (node == null) 
				return false;
			
			if (is_String(selector)) {
				if (type == null) 
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				
				selector = selector_parse(selector, type);
			}
		
			var obj = selector.prop ? node[selector.prop] : node;
			if (obj == null) 
				return false;
			
			if (is_Function(selector.selector)) 
				return selector.selector(obj[selector.key]);
			
			// regexp
			if (selector.selector.test != null) 
				return selector.selector.test(obj[selector.key]);
			
			// string | int
			/* jshint eqeqeq: false */
			return obj[selector.key] == selector.selector;
			/* jshint eqeqeq: true */
		}
		
		// PRIVATE
		
		function sel_hasClassDelegate(matchClass) {
			return function(className){
				return sel_hasClass(className, matchClass);
			};
		}
		
		// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
		function sel_hasClass(className, matchClass, index) {
			if (typeof className !== 'string')
				return false;
			
			if (index == null) 
				index = 0;
				
			index = className.indexOf(matchClass, index);
		
			if (index === -1)
				return false;
		
			if (index > 0 && className.charCodeAt(index - 1) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			var class_Length = className.length,
				match_Length = matchClass.length;
				
			if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			return true;
		}
		
	}());
	
	// end:source ./selector.js
	// source ./traverse.js
	var find_findSingle,
		find_findAll;
	(function(){
		
		find_findSingle = function(node, matcher) {
			if (node == null) 
				return null;
			
			if (is_Array(node)) {
				var imax = node.length,
					i = 0, x;
				
				for(; i < imax; i++) {
					x = find_findSingle(node[i], matcher);
					if (x != null) 
						return x;
				}
				return null;
			}
		
			if (selector_match(node, matcher))
				return node;
			
			node = node[matcher.nextKey];
			return node == null
				? null
				: find_findSingle(node, matcher)
				;
		};
	
		find_findAll = function(node, matcher, out) {
			if (out == null) 
				out = [];
			
			if (is_Array(node)) {
				var imax = node.length,
					i = 0, x;
				
				for(; i < imax; i++) {
					find_findAll(node[i], matcher, out);
				}
				return out;
			}
			
			if (selector_match(node, matcher))
				out.push(node);
			
			node = node[matcher.nextKey];
			return node == null
				? out
				: find_findAll(node, matcher, out)
				;
		};
		
	}());
	
	// end:source ./traverse.js
	// source ./dom.js
	var dom_addEventListener,
		
		node_tryDispose,
		node_tryDisposeChildren
		;
		
	(function(){
	
		dom_addEventListener = function(el, event, fn, param, ctr) {
		
			if (TouchHandler.supports(event)) {
				TouchHandler.on(el, event, fn);
				return;
			}
			if (KeyboardHandler.supports(event, param)) {
				KeyboardHandler.attach(el, event, param, fn, ctr);
				return;
			}
			// allows custom events - in x-signal, for example
			if (domLib != null) 
				return domLib(el).on(event, fn);
			
			if (el.addEventListener != null) 
				return el.addEventListener(event, fn, false);
			
			if (el.attachEvent) 
				el.attachEvent('on' + event, fn);
		};
	
		node_tryDispose = function(node){
			if (node.hasAttribute('x-compo-id')) {
				
				var id = node.getAttribute('x-compo-id'),
					compo = Anchor.getByID(id)
					;
				
				if (compo != null) {
					if (compo.$ == null || compo.$.length === 1) {
						compo_dispose(compo);
						compo_detachChild(compo);
						return;
					}
					var i = _Array_indexOf.call(compo.$, node);
					if (i !== -1) 
						_Array_splice.call(compo.$, i, 1);
				}
			}
			node_tryDisposeChildren(node);
		};
		
		node_tryDisposeChildren = function(node){
			
			var child = node.firstChild;
			while(child != null) {
				
				if (child.nodeType === 1) 
					node_tryDispose(child);
				
				
				child = child.nextSibling;
			}
		};
		
	}());
	
	// end:source ./dom.js
	// source ./domLib.js
	/**
	 *	Combine .filter + .find
	 */
	
	var domLib_find,
		domLib_on
		;
	
	(function(){
			
		domLib_find = function($set, selector) {
			return $set.filter(selector).add($set.find(selector));
		};
		
		domLib_on = function($set, type, selector, fn) {
		
			if (selector == null) 
				return $set.on(type, fn);
			
			$set
				.on(type, selector, fn)
				.filter(selector)
				.on(type, fn);
				
			return $set;
		};
		
	}());
	
	
	// end:source ./domLib.js
	// source ./compo.js
	var compo_dispose,
		compo_detachChild,
		compo_ensureTemplate,
		compo_ensureAttributes,
		compo_attachDisposer,
		compo_removeElements,
		compo_prepairAsync,
		compo_errored,
		
		compo_meta_prepairAttributeHandler,
		compo_meta_executeAttributeHandler
		;
	
	(function(){
		
		compo_dispose = function(compo) {
			if (compo.dispose != null) 
				compo.dispose();
			
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
	
		compo_prepairAsync = function(dfr, compo, ctx){
			var resume = Compo.pause(compo, ctx)
			dfr.then(resume, function(error){
				compo_errored(compo, error);
				resume();
			});
		};
		
		compo_errored = function(compo, error){
			compo.nodes = mask.parse('.-mask-compo-errored > "~[.]"');
			compo.model = error.message || String(error);
			compo.renderEnd = fn_doNothing;
		};
		
		// == Meta Attribute Handler
		(function(){
			
			compo_meta_prepairAttributeHandler = function(Proto){
				if (Proto.meta == null) {
					Proto.meta = {
						attributes: null,
						cache: null,
						mode: null
					};
				}
				
				var attr = Proto.meta.attributes,
					fn = null;
				if (attr) {
					var hash = {};
					for(var key in attr) {
						_handleProperty_Delegate(Proto, key, attr[key], hash);
					}
					fn = _handleAll_Delegate(hash);
				}
				Proto.meta.handleAttributes = fn;
			};
			compo_meta_executeAttributeHandler = function(compo, model){
				var fn = compo.meta && compo.meta.handleAttributes;
				return fn == null ? true : fn(compo, model);
			};
			
			function _handleAll_Delegate(hash){
				return function(compo, model){
					var attr = compo.attr,
						key, fn, val, error;
					for(key in hash){
						fn    = hash[key];
						val   = attr[key];
						error = fn(compo, val, model);
						
						if (error == null)
							continue;
						
						_errored(compo, error, key, val)
						return false;
					}
					return true;
				};
			}
			function _handleProperty_Delegate(Proto, metaKey, metaVal, hash) {
				var optional = metaKey.charCodeAt(0) === 63, // ?
					attrName = optional
						? metaKey.substring(1)
						: metaKey;
				
				var property = attrName.replace(/-(\w)/g, _toCamelCase_Replacer),
					fn = metaVal;
				
				if (typeof metaVal === 'string') 
					fn = _ensureFns[metaVal];
					
				else if (metaVal instanceof RegExp) 
					fn = _ensureFns_Delegate.regexp(metaVal);
				
				else if (typeof metaVal === 'function') 
					fn = metaVal;
				
				else if (metaVal == null) 
					fn = _ensureFns_Delegate.any();
				
				if (fn == null) {
					log_error('Function expected for the attr. handler', metaKey);
					return;
				}
				
				Proto[property] = null;
				Proto = null;
				hash [attrName] = function(compo, attrVal, model){
					if (attrVal == null) 
						return optional ? null : Error('Expected');
					
					var val = fn.call(compo, attrVal, compo, model, attrName);
					if (val instanceof Error) 
						return val;
					
					compo[property] = val;
					return null;
				};
			}
			
			function _toCamelCase_Replacer(full, char_){
				return char_.toUpperCase();
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
				}
			};
		}());
		function getTemplateProp_(compo){
			var template = compo.template;
			if (template == null) {
				template = compo.attr.template;
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
	}());
	
	// end:source ./compo.js
	// source ./compo_create.js
	var compo_create,
		compo_createConstructor;
	(function(){
		compo_create = function(arguments_){
			
			var argLength = arguments_.length,
				Proto = arguments_[argLength - 1],
				Ctor,
				key;
			
			if (argLength > 1) 
				compo_inherit(Proto, _Array_slice.call(arguments_, 0, argLength - 1));
			
			if (Proto == null)
				Proto = {};
			
			var include = _resolve_External('include');
			if (include != null) 
				Proto.__resource = include.url;
			
			var attr = Proto.attr;
			for (key in Proto.attr) {
				Proto.attr[key] = _mask_ensureTmplFn(Proto.attr[key]);
			}
			
			var slots = Proto.slots;
			for (key in slots) {
				if (typeof slots[key] === 'string'){
					//if DEBUG
					if (is_Function(Proto[slots[key]]) === false)
						log_error('Not a Function @Slot.',slots[key]);
					// endif
					slots[key] = Proto[slots[key]];
				}
			}
			
			compo_meta_prepairAttributeHandler(Proto);
			
			Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function CompoBase() {}
				;
			
			Ctor = compo_createConstructor(Ctor, Proto);
	
			for(key in CompoProto){
				if (Proto[key] == null)
					Proto[key] = CompoProto[key];
			}
	
			Ctor.prototype = Proto;
			Proto = null;
			return Ctor;
		};
		
		compo_createConstructor = function(Ctor, proto) {
			var compos = proto.compos,
				pipes = proto.pipes,
				scope = proto.scope,
				attr = proto.attr;
				
			if (compos   == null
				&& pipes == null
				&& attr  == null
				&& scope == null) {
				return Ctor;
			}
		
			/* extend compos / attr to keep
			 * original prototyped values untouched
			 */
			return function CompoBase(node, model, ctx, container, ctr){
				
				if (Ctor != null) {
					var overriden = Ctor.call(this, node, model, ctx, container, ctr);
					if (overriden != null) 
						return overriden;
				}
				
				if (compos != null) {
					// use this.compos instead of compos from upper scope
					// : in case compos they were extended after
					this.compos = obj_create(this.compos);
				}
				
				if (pipes != null) 
					Pipes.addController(this);
				
				if (attr != null) 
					this.attr = obj_create(this.attr);
				
				if (scope != null) 
					this.scope = obj_create(this.scope);
			};
		};
	}());
	// end:source ./compo_create.js
	// source ./compo_inherit.js
	var compo_inherit;
	(function(mask_merge){
		
		compo_inherit = function(Proto, Extends){
			var imax = Extends.length,
				i = imax,
				ctors = [],
				x;
			while( --i > -1){
				x = Extends[i];
				if (typeof x === 'string') 
					x = Mask.getHandler(x);
				if (x == null) {
					log_error('Base component not defined', Extends[i]);
					continue;
				}
				if (typeof x === 'function') {
					ctors.push(x);
					x = x.prototype;
				}
				inherit_(Proto, x, 'node');
			}
			
			i = -1;
			imax = ctors.length;
			if (imax > 0) {
				if (Proto.hasOwnProperty('constructor')) 
					ctors.unshift(Proto.constructor);
				
				Proto.constructor = joinFns_(ctors);
			}
			var meta = Proto.meta;
			if (meta == null) 
				meta = Proto.meta = {};
			
			if (meta.template == null) 
				meta.template = 'merge';
		};
		
		function inherit_(target, source, name){
			if (target == null || source == null) 
				return;
			
			if ('node' === name) {
				var targetNodes = target.template || target.nodes,
					sourceNodes = source.template || source.nodes;
				target.template = targetNodes == null || sourceNodes == null
					? (targetNodes || sourceNodes)
					: (mask.merge(sourceNodes, targetNodes, target));
				
				if (target.nodes != null) {
					target.nodes = target.template;
				}
			}
			
			var mix, type, fnAutoCall, hasFnOverrides = false;
			for(var key in source){
				mix = source[key];
				if (mix == null || key === 'constructor')
					continue;
				
				if ('node' === name && (key === 'template' || key === 'nodes')) 
					continue;
				
				type = typeof mix;
				
				if (target[key] == null) {
					target[key] = 'object' === type
						? clone_(mix)
						: mix;
					continue;
				}
				if ('node' === name) {
					// http://jsperf.com/indexof-vs-bunch-of-if
					var isSealed = key === 'renderStart' ||
							key === 'renderEnd' ||
							key === 'emitIn' ||
							key === 'emitOut' ||
							key === 'components' ||
							key === 'nodes' ||
							key === 'template' ||
							key === 'find' ||
							key === 'closest' ||
							key === 'on' ||
							key === 'remove' ||
							key === 'slotState' ||
							key === 'signalState' ||
							key === 'append' ||
							key === 'appendTo'
							;
					if (isSealed === true) 
						continue;
				}
				if ('pipes' === name) {
					inherit_(target[key], mix, 'pipe');
					continue;
				}
				if ('function' === type) {
					fnAutoCall = false;
					if ('slots' === name || 'events' === name || 'pipe' === name)
						fnAutoCall = true;
					else if ('node' === name && ('onRenderStart' === key || 'onRenderEnd' === key)) 
						fnAutoCall = true;
					
					target[key] = createWrapper_(target[key], mix, fnAutoCall);
					hasFnOverrides = true;
					continue;
				}
				if ('object' !== type) {
					continue;
				}
				
				switch(key){
					case 'slots':
					case 'pipes':
					case 'events':
					case 'attr':
						inherit_(target[key], mix, key);
						continue;
				}
				defaults_(target[key], mix);
			}
			
			if (hasFnOverrides === true) {
				if (target.super != null) 
					log_error('`super` property is reserved. Dismissed. Current prototype', target);
				target.super = null;
			}
		}
		
		/*! Circular references are not handled */
		function clone_(a) {
			if (a == null) 
				return null;
			
			if (typeof a !== 'object') 
				return a;
			
			if (is_Array(a)) {
				var imax = a.length,
					i = -1,
					arr = new Array(imax)
					;
				while( ++i < imax ){
					arr[i] = clone_(a[i]);
				}
				return arr;
			}
			
			var object = obj_create(a),
				key, val;
			for(key in object){
				val = object[key];
				if (val == null || typeof val !== 'object') 
					continue;
				object[key] = clone_(val);
			}
			return object;
		}
		function defaults_(target, source){
			var targetV, sourceV, key;
			for(var key in source){
				targetV = target[key];
				sourceV = source[key];
				if (targetV == null) {
					target[key] = sourceV;
					continue;
				}
				if (is_rawObject(targetV) && is_rawObject(sourceV)){
					defaults_(targetV, sourceV);
					continue;
				}
			}
		}
		function createWrapper_(selfFn, baseFn, autoCallFunctions){
			if (selfFn.name === 'compoInheritanceWrapper') {
				selfFn._fn_chain.push(baseFn);
				return selfFn;
			}
			
			var compileFns = autoCallFunctions === true
				? compileFns_autocall_
				: compileFns_
				;
			function compoInheritanceWrapper(){
				var fn = x._fn || (x._fn = compileFns(x._fn_chain));
				return fn.apply(this, arguments);
			}
			
			var x = compoInheritanceWrapper;
			x._fn_chain = [ selfFn, baseFn ];
			x._fn = null;
			
			return x;
		}
		function compileFns_(fns){
			var i = fns.length,
				fn = fns[ --i ];
			while( --i > -1){
				fn = inheritFn_(fns[i], fn);
			}
			return fn;
		}
		function compileFns_autocall_(fns) {
			var imax = fns.length;
			return function(){
				var result, fn, x,
					i = imax;
				while( --i > -1 ){
					fn = fns[i];
					if (fn == null) 
						continue;
					
					x = fn_apply(fn, this, arguments);
					if (x !== void 0) {
						result = x;
					}
				}
				return result;
			}
		}
		function inheritFn_(selfFn, baseFn){
			return function(){
				this.super = baseFn;
				var x = fn_apply(selfFn, this, arguments);
				
				this.super = null;
				return x;
			};
		}
		function joinFns_(fns) {
			var imax = fns.length;
			return function(){
				var i = imax, result;
				while( --i > -1 ){
					var x = fns[i].apply(this, arguments);
					if (x != null) {
						// use last return
						result = x;
					}
				}
				return result;
			};
		}
	}(mask.merge));
	// end:source ./compo_inherit.js
	// source ./dfr.js
	var dfr_isBusy;
	(function(){
		dfr_isBusy = function(dfr){
			if (dfr == null || typeof dfr.then !== 'function') 
				return false;
			
			// Class.Deferred
			if (is_Function(dfr.isBusy)) 
				return dfr.isBusy();
			
			// jQuery Deferred
			if (is_Function(dfr.state)) 
				return dfr.state() === 'pending';
			
			log_warn('Class or jQuery deferred interface expected');
			return false;
		};
	}());
	// end:source ./dfr.js
	
	// end:source /src/util/exports.js

	// source /src/compo/children.js
	var Children_ = {
	
		/**
		 *	Component children. Example:
		 *
		 *	Class({
		 *		Base: Compo,
		 *		Construct: function(){
		 *			this.compos = {
		 *				panel: '$: .container',  // querying with DOMLib
		 *				timePicker: 'compo: timePicker', // querying with Compo selector
		 *				button: '#button' // querying with querySelector***
		 *			}
		 *		}
		 *	});
		 *
		 */
		select: function(component, compos) {
			for (var name in compos) {
				var data = compos[name],
					events = null,
					selector = null;
	
				if (data instanceof Array) {
					selector = data[0];
					events = data.splice(1);
				}
				if (typeof data === 'string') {
					selector = data;
				}
				if (data == null || selector == null) {
					log_error('Unknown component child', name, compos[name]);
					log_warn('Is this object shared within multiple compo classes? Define it in constructor!');
					return;
				}
	
				var index = selector.indexOf(':'),
					engine = selector.substring(0, index);
	
				engine = Compo.config.selectors[engine];
	
				if (engine == null) {
					component.compos[name] = component.$[0].querySelector(selector);
				} else {
					selector = selector.substring(++index).trim();
					component.compos[name] = engine(component, selector);
				}
	
				var element = component.compos[name];
	
				if (events != null) {
					if (element.$ != null) {
						element = element.$;
					}
					
					Events_.on(component, events, element);
				}
			}
		}
	};
	
	// end:source /src/compo/children.js
	// source /src/compo/events.js
	var Events_ = {
		on: function(component, events, $element) {
			if ($element == null) {
				$element = component.$;
			}
	
			var isarray = events instanceof Array,
				length = isarray ? events.length : 1;
	
			for (var i = 0, x; isarray ? i < length : i < 1; i++) {
				x = isarray ? events[i] : events;
	
				if (x instanceof Array) {
					// generic jQuery .on Arguments
	
					if (EventDecorator != null) {
						x[0] = EventDecorator(x[0]);
					}
	
					$element.on.apply($element, x);
					continue;
				}
	
	
				for (var key in x) {
					var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
						semicolon = key.indexOf(':'),
						type,
						selector;
	
					if (semicolon !== -1) {
						type = key.substring(0, semicolon);
						selector = key.substring(semicolon + 1).trim();
					} else {
						type = key;
					}
	
					if (EventDecorator != null) {
						type = EventDecorator(type);
					}
	
					domLib_on($element, type, selector, fn_proxy(fn, component));
				}
			}
		}
	},
		EventDecorator = null;
	
	// end:source /src/compo/events.js
	// source /src/compo/events.deco.js
	var EventDecos = (function() {
	
		var hasTouch = (function() {
			if (document == null) {
				return false;
			}
			if ('createTouch' in document) {
				return true;
			}
			try {
				return !!document.createEvent('TouchEvent').initTouchEvent;
			} catch (error) {
				return false;
			}
		}());
	
		return {
	
			'touch': function(type) {
				if (hasTouch === false) {
					return type;
				}
	
				if ('click' === type) {
					return 'touchend';
				}
	
				if ('mousedown' === type) {
					return 'touchstart';
				}
	
				if ('mouseup' === type) {
					return 'touchend';
				}
	
				if ('mousemove' === type) {
					return 'touchmove';
				}
	
				return type;
			}
		};
	
	}());
	
	// end:source /src/compo/events.deco.js
	// source /src/compo/pipes.js
	var Pipes = (function() {
		
		var _collection = {};
	
		mask.registerAttrHandler('x-pipe-signal', 'client', function(node, attrValue, model, cntx, element, controller) {
	
			var arr = attrValue.split(';'),
				imax = arr.length,
				i = -1,
				x;
			while ( ++i < imax ) {
				x = arr[i].trim();
				if (x === '') 
					continue;
				
				var i_colon = x.indexOf(':'),
					event = x.substring(0, i_colon),
					handler = x.substring(i_colon + 1).trim(),
					dot = handler.indexOf('.'),
					
					pipe, signal;
	
				if (dot === -1) {
					log_error('define pipeName "click: pipeName.pipeSignal"');
					return;
				}
	
				pipe = handler.substring(0, dot);
				signal = handler.substring(++dot);
	
				var Handler = _handler(pipe, signal);
	
	
				// if DEBUG
				!event && log_error('Signal: event type is not set', attrValue);
				// endif
	
	
				dom_addEventListener(element, event, Handler);
	
			}
		});
	
		function _handler(pipe, signal) {
			return function(event){
				new Pipe(pipe).emit(signal, event);
			};
		}
	
	
		function pipe_attach(pipeName, controller) {
			if (controller.pipes[pipeName] == null) {
				log_error('Controller has no pipes to be added to collection', pipeName, controller);
				return;
			}
	
			if (_collection[pipeName] == null) {
				_collection[pipeName] = [];
			}
			_collection[pipeName].push(controller);
		}
	
		function pipe_detach(pipeName, controller) {
			var pipe = _collection[pipeName],
				i = pipe.length;
	
			while (--i > -1) {
				if (pipe[i] === controller) 
					pipe.splice(i, 1);
			}
	
		}
	
		function controller_remove() {
			var	controller = this,
				pipes = controller.pipes;
			for (var key in pipes) {
				pipe_detach(key, controller);
			}
		}
	
		function controller_add(controller) {
			var pipes = controller.pipes;
	
			// if DEBUG
			if (pipes == null) {
				log_error('Controller has no pipes', controller);
				return;
			}
			// endif
	
			for (var key in pipes) {
				pipe_attach(key, controller);
			}
	
			Compo.attachDisposer(controller, controller_remove.bind(controller));
		}
	
		function Pipe(pipeName) {
			if (this instanceof Pipe === false) {
				return new Pipe(pipeName);
			}
			this.pipeName = pipeName;
	
			return this;
		}
		Pipe.prototype = {
			constructor: Pipe,
			emit: function(signal){
				var controllers = _collection[this.pipeName],
					pipeName = this.pipeName,
					args;
				
				if (controllers == null) {
					//if DEBUG
					log_warn('Pipe.emit: No signals were bound to:', pipeName);
					//endif
					return;
				}
				
				/**
				 * @TODO - for backward comp. support
				 * to pass array of arguments as an Array in second args
				 *
				 * - switch to use plain arguments
				 */
				
				if (arguments.length === 2 && is_Array(arguments[1])) 
					args = arguments[1];
					
				else if (arguments.length > 1) 
					args = _Array_slice.call(arguments, 1);
				
				
				var i = controllers.length,
					controller, slots, slot, called;
	
				while (--i !== -1) {
					controller = controllers[i];
					slots = controller.pipes[pipeName];
	
					if (slots == null) 
						continue;
					
					slot = slots[signal];
					if (is_Function(slot)) {
						slot.apply(controller, args);
						called = true;
					}
				}
	
				// if DEBUG
				if (!called)
					log_warn('Pipe `%s` has not slots for `%s`', pipeName, signal);
				// endif
			}
		};
	
		Pipe.addController = controller_add;
		Pipe.removeController = controller_remove;
	
		return {
			addController: controller_add,
			removeController: controller_remove,
	
			pipe: Pipe
		};
	
	}());
	
	// end:source /src/compo/pipes.js
	
	// source /src/keyboard/Handler.js
	var KeyboardHandler;
	(function(){
		
		// source ./utils.js
		var event_bind,
			event_unbind,
			event_getCode;
		(function(){
			
			event_bind = function (el, type, mix){
				el.addEventListener(type, mix, false);
			};
			event_unbind = function (el, type, mix) {
				el.removeEventListener(type, mix, false);
			};	
			
			event_getCode = function(event){
				var code = event.keyCode || event.which;
				
				if (code >= 96 && code <= 105) {
					// numpad digits
					return code - 48;
				}
				
				return code;
			};
			
		}());
		
		// end:source ./utils.js
		// source ./const.js
		var CODES, SHIFT_NUMS, MODS;
		
		CODES = {
			"backspace": 8,
			"tab": 9,
			"return": 13,
			"enter": 13,
			"shift": 16,
			"ctrl": 17,
			"control": 17,
			"alt": 18,
			"option": 18,
			
			"fn": 255,
			
			"pause": 19,
			"capslock": 20,
			"esc": 27,
			"space": 32,
			"pageup": 33,
			"pagedown": 34,
			"end": 35,
			"home": 36,
			"start": 36,
			
			"left": 37,
			"up": 38,
			"right": 39,
			"down": 40,
			
			"insert": 45,
			"ins": 45,
			"del": 46,
			"numlock": 144,
			"scroll": 145,
			
			"f1": 112,
			"f2": 113,
			"f3": 114,
			"f4": 115,
			"f5": 116,
			"f6": 117,
			"f7": 118,
			"f8": 119,
			"f9": 120,
			"f10": 121,
			"f11": 122,
			"f12": 123,
			
			";": 186,
			"=": 187,
			"*": 106,
			"+": 107,
			"-": 189,
			".": 190,
			"/": 191,
			
			",": 188,
			"`": 192,
			"[": 219,
			"\\": 220,
			"]": 221,
			"'": 222
		};
		
		SHIFT_NUMS = {
		  "`": "~",
		  "1": "!",
		  "2": "@",
		  "3": "#",
		  "4": "$",
		  "5": "%",
		  "6": "^",
		  "7": "&",
		  "8": "*",
		  "9": "(",
		  "0": ")",
		  "-": "_",
		  "=": "+",
		  ";": ": ",
		  "'": "\"",
		  ",": "<",
		  ".": ">",
		  "/": "?",
		  "\\": "|"
		};
		
		MODS = {
			'16': 'shiftKey',
			'17': 'ctrlKey',
			'18': 'altKey',
		};
		// end:source ./const.js
		// source ./filters.js
		var filter_isKeyboardInput,
			filter_skippedInput,
			filter_skippedComponent,
			filter_skippedElement;
		(function(){
			filter_skippedInput = function(event, code){
				if (event.ctrlKey || event.altKey) 
					return false;
				return filter_isKeyboardInput(event.target);
			};
			
			filter_skippedComponent = function(compo){
				if (compo.$ == null || compo.$.length === 0) {
					return false;
				}
				return filter_skippedElement(compo.$.get(0));
			};
			filter_skippedElement = function(el) {
				if (document.contains(el) === false) 
					return false;
				
				if (el.style.display === 'none')
					return false;
				
				var disabled = el.disabled;
				if (disabled === true) 
					return false;
				
				return true;
			};
			filter_isKeyboardInput = function (el) {
				var tag = el.tagName;
				if ('TEXTAREA' === tag) {
					return true;
				}
				if ('INPUT' !== tag) {
					return false;
				}
				return TYPELESS_INPUT.indexOf(' ' + el.type + ' ') === -1;
			};
			
			var TYPELESS_INPUT = ' button submit checkbox file hidden image radio range reset ';
		}());
		// end:source ./filters.js
		// source ./Hotkey.js
		var Hotkey;
		(function(){
			Hotkey = {
				on: function(combDef, fn, compo) {
					if (handler == null) init();
					
					var comb = IComb.create(
						combDef
						, 'keydown'
						, fn
						, compo
					);
					handler.attach(comb);
				},
				off: function(fn){
					handler.off(fn);
				},
				handleEvent: function(event){
					handler.handle(event.type, event_getCode(event), event);
				},
				reset: function(){
					handler.reset();
				}
			};
			var handler;
			function init() {
				handler = new CombHandler();
				event_bind(window, 'keydown', Hotkey);
				event_bind(window, 'keyup', Hotkey);
				event_bind(window, 'focus', Hotkey.reset);
			}
		}());
		// end:source ./Hotkey.js
		// source ./IComb.js
		var IComb;
		(function(){
			IComb = function(set){
				this.set = set;
			};
			IComb.parse = function (str) {
				var parts = str.split(','),
					combs = [],
					imax = parts.length,
					i = 0;
				for(; i < imax; i++){
					combs[i] = parseSingle(parts[i]);
				}
				return combs;
			};
			IComb.create = function (def, type, fn, ctx) {
				var codes = IComb.parse(def);
				var comb = Key.create(codes);
				if (comb == null) {
					comb = new KeySequance(codes)
				}
				comb.init(type, fn, ctx);
				return comb;
			};
			IComb.prototype = {
				type: null,
				ctx: null,
				set: null,
				fn: null,
				init: function(type, fn, ctx){
					this.type = type;
					this.ctx = ctx;
					this.fn = fn;
				},
				tryCall: null
			};
			
			function parseSingle(str) {
				var keys = str.split('+'),
					imax = keys.length,
					i = 0,
					out = [], x, code;
				for(; i < imax; i++){
					x = keys[i].trim();
					code = CODES[x];
					if (code === void 0) {
						if (x.length !== 1) 
							throw Error('Unexpected sequence. Use `+` sign to define the sequence:' + x)
						
						code = x.toUpperCase().charCodeAt(0);
					}
					out[i] = code;
				}
				return {
					last: out[imax - 1],
					keys: out.sort()
				};
			}
		}());
		// end:source ./IComb.js
		// source ./Key.js
		var Key;
		(function(){
			Key = class_create(IComb, {
				constructor: function(set, key, mods){
					this.key = key;
					this.mods = mods;
				},
				tryCall: function(event, codes, lastCode){
					if (event.type !== this.type || lastCode !== this.key) {
						return Key_MATCH_FAIL;
					}
					
					for (var key in this.mods){
						if (event[key] !== this.mods[key]) 
							return Key_MATCH_FAIL;
					}
					
					this.fn.call(this.ctx, event);
					return Key_MATCH_OK;
				}
			});
			
			Key.create = function(set){
				if (set.length !== 1) 
					return null;
				var keys = set[0].keys,
					i = keys.length,
					mods = {
						shiftKey: false,
						ctrlKey: false,
						altKey: false
					};
				
				var key, mod, hasMod;
				while(--i > -1){
					if (MODS.hasOwnProperty(keys[i]) === false) {
						if (key != null) 
							return null;
						key = keys[i];
						continue;
					}
					mods[MODS[keys[i]]] = true;
					hasMod = true;
				}
				return new Key(set, key, mods);
			};
			
		}());
		// end:source ./Key.js
		// source ./KeySequance.js
		var KeySequance,
			Key_MATCH_OK = 1,
			Key_MATCH_FAIL = 2,
			Key_MATCH_WAIT = 3,
			Key_MATCH_NEXT = 4;
		
		(function(){
			KeySequance = class_create(IComb, {
				index: 0,
				tryCall: function(event, codes, lastCode){
					var matched = this.check_(codes, lastCode);
					if (matched === Key_MATCH_OK) {
						this.index = 0;
						this.fn.call(this.ctx, event);
					}
					return matched;
				},
				fail_: function(){
					this.index = 0;
					return Key_MATCH_FAIL;
				},
				check_: function(codes, lastCode){
					var current = this.set[this.index],
						keys = current.keys,
						last = current.last;
				
					var l = codes.length;
					if (l < keys.length) 
						return Key_MATCH_WAIT;
					if (l > keys.length) 
						return this.fail_();
					
					if (last !== lastCode) {
						return this.fail_();
					}
					while (--l > -1) {
						if (keys[l] !== codes[l]) 
							return this.fail_();
					}
					if (this.index < this.set.length - 1) {
						this.index++;
						return Key_MATCH_NEXT;
					}
					this.index = 0;
					return Key_MATCH_OK;
				}
			});
			
		}());
		
		
		// end:source ./KeySequance.js
		// source ./CombHandler.js
		var CombHandler;
		(function(){
			CombHandler = function(){
				this.keys = [];
				this.combs = [];
			};
			CombHandler.prototype = {
				keys: null,
				combs: null,
				attach: function(comb) {
					this.combs.push(comb);
				},
				off: function(fn){
					var imax = this.combs.length,
						i = 0;
					for(; i < imax; i++){
						if (this.combs[i].fn === fn) {
							this.combs.splice(i, 1);
							return true;
						}
					}
					return false;
				},
				handle: function(type, code, event){
					if (this.combs.length === 0) {
						return;
					}
					if (this.filter_(event, code)) {
						return;
					}
					if (type === 'keydown') {
						if (this.add_(code)) {
							this.emit_(type, event, code);
						}
						return;
					}
					if (type === 'keyup') {
						this.emit_(type, event, code);
						this.remove_(code);
					}
				},
				handleEvent: function(event){
					var code = event_getCode(event),
						type = event.type;
					this.handle(type, code, event);
				},
				reset: function(){
					this.keys.length = 0;
				},
				add_: function(code){
					var imax = this.keys.length,
						i = 0, x;
					for(; i < imax; i++){
						x = this.keys[i];
						if (x === code) 
							return false;
						
						if (x > code) {
							this.keys.splice(i, 0, code);
							return true;
						}
					}
					this.keys.push(code);
					return true;
				},
				remove_: function(code){
					var i = this.keys.length;
					while(--i > -1){
						if (this.keys[i] === code) {
							this.keys.splice(i, 1);
							return;
						}
					}
				},
				emit_: function(type, event, lastCode){
					var next = false,
						combs = this.combs,
						imax = combs.length,
						i = 0, x, stat;
					for(; i < imax; i++){
						x = combs[i];
						if (x.type !== type) 
							continue;
						
						stat = x.tryCall(event, this.keys, lastCode);
						if (Key_MATCH_OK === stat || stat === Key_MATCH_NEXT) {
							event.preventDefault();
						}
						if (stat === Key_MATCH_WAIT || stat === Key_MATCH_NEXT) {
							next = true;
						}
					}
					if (next === false) {
						//-this.keys.length = 0;
					}
				},
				filter_: function(event, code){
					return filter_skippedInput(event, code);
				}
			};
		}());
		// end:source ./CombHandler.js
		
		KeyboardHandler = {
			supports: function(event, param){
				if (param == null) 
					return false;
				switch(event){
					case 'press':
					case 'keypress':
					case 'keydown':
					case 'keyup':
					case 'hotkey':
					case 'shortcut':
						return true;
				}
				return false;
			},
			on: function(el, type, def, fn){
				if (type === 'keypress' || type === 'press') {
					type = 'keydown';
				}
				var comb = IComb.create(def, type, fn);
				if (comb instanceof Key) {
					event_bind(el, type, function (event) {
						var code = event_getCode(event);
						var r = comb.tryCall(event, null, code);
						if (r === Key_MATCH_OK) 
							event.preventDefault();
					});
					return;
				}
				
				var handler = new CombHandler;
				event_bind(el, 'keydown', handler);
				event_bind(el, 'keyup', handler);
				handler.attach(comb);
			},
			hotkeys: function(compo, hotkeys){
				var fns = [], fn, comb;
				for(comb in hotkeys) {
					fn = hotkeys[comb];
					Hotkey.on(comb, fn, compo);
				}
				compo_attachDisposer(compo, function(){
					var comb, fn;
					for(comb in hotkeys) {
						Hotkey.off(hotkeys[comb]);
					}
				});
			},
			attach: function(el, type, comb, fn, ctr){
				if (filter_isKeyboardInput(el)) {
					this.on(el, type, comb, fn);
				}
				var x = ctr;
				while(x && x.slots == null) {
					x = x.parent;
				}
				if (x == null) {
					log_error('Slot-component not found:', comb);
					return;
				}
				var hotkeys = x.hotkeys;
				if (hotkeys == null) {
					hotkeys = x.hotkeys = {};
				}
				hotkeys[comb] = fn;
			}
		};
	}());
	// end:source /src/keyboard/Handler.js
	// source /src/touch/Handler.js
	var TouchHandler;
	(function(){
		
		// source ./utils.js
		var event_bind,
			event_unbind,
			event_trigger,
			isTouchable;
		
		(function(){
			isTouchable = 'ontouchstart' in global;
			
			event_bind = function(el, type, mix) {
				el.addEventListener(type, mix, false);
			};
			event_unbind = function (el, type, mix) {
				el.removeEventListener(type, mix, false);
			};
			event_trigger = function(el, type) {
				var event = new CustomEvent(type, {
					cancelable: true,
					bubbles: true
				});
				el.dispatchEvent(event);
			};
		}());
			
		// end:source ./utils.js
		// source ./Touch.js
		var Touch;
		(function(){
			Touch = function(el, type, fn) {
				this.el = el;
				this.fn = fn;
				this.dismiss = 0;
				event_bind(el, type, this);
				event_bind(el, MOUSE_MAP[type], this);
			};
			
			var MOUSE_MAP = {
				'mousemove': 'touchmove',
				'mousedown': 'touchstart',
				'mouseup': 'touchend'
			};
			var TOUCH_MAP = {
				'touchmove': 'mousemove',
				'touchstart': 'mousedown',
				'touchup': 'mouseup'
			};
			
			Touch.prototype = {
				handleEvent: function (event) {
					switch(event.type){
						case 'touchstart':
						case 'touchmove':
						case 'touchend':
							this.dismiss++;
							event = prepairTouchEvent(event);
							this.fn(event);
							break;
						case 'mousedown':
						case 'mousemove':
						case 'mouseup':
							if (--this.dismiss < 0) {
								this.dismiss = 0;
								this.fn(event);
							}
							break;
					}
				}
			};
			function prepairTouchEvent(event){
				var touch = null,
					touches = event.changedTouches;
				if (touches && touches.length) {
					touch = touches[0];
				}
				if (touch == null && event.touches) {
					touch = event.touches[0];
				}
				if (touch == null) {
					return event;
				}
				return createMouseEvent(event, touch);
			}
			function createMouseEvent (event, touch) {
				var obj = Object.create(MouseEvent.prototype);
				for (var key in event) {
					obj[key] = event[key];
				}
				for (var key in PROPS) {
					obj[key] = touch[key];
				}
				return new MouseEvent(TOUCH_MAP[event.type], obj);
			}
			var PROPS = {
				clientX: 1,
				clientY: 1,
				pageX: 1,
				pageY: 1,
				screenX: 1,
				screenY: 1
			};
		}());
		// end:source ./Touch.js
		// source ./FastClick.js
		var FastClick;
		(function(){
			FastClick = function (el, fn) {
				this.state = 0;
				this.el = el;
				this.fn = fn;
				this.startX = 0;
				this.startY = 0;
				this.tStart = 0;
				this.tEnd = 0;
				this.dismiss = 0;
				
				event_bind(el, 'touchstart', this);
				event_bind(el, 'touchend', this);
				event_bind(el, 'click', this);
			};
			
			var threshold_TIME = 300,
				threshold_DIST = 10;
			
			FastClick.prototype = {
				handleEvent: function (event) {
					switch (event.type) {
						case 'touchmove':
							this.touchmove(event);
							break;
						case 'touchstart':
							this.touchstart(event);
							break;
						case 'touchend':
							this.touchend(event);
							break;
						case 'touchcancel':
							this.reset();
							break;
						case 'click':
							this.click(event);
							break;
					}
				},
				
				touchstart: function(event){
					event_bind(document.body, 'touchmove', this);
					
					var e = event.touches[0];
					
					this.state  = 1;
					this.tStart = event.timeStamp;
					this.startX = e.clientX;
					this.startY = e.clientY;
				},
				touchend: function (event) {
					this.tEnd = event.timeStamp;
					if (this.state === 1) {
						this.dismiss++;
						if (this.tEnd - this.tStart <= threshold_TIME) {
							this.call(event);
							return;
						}
						
						event_trigger(this.el, 'taphold');
						return;
					}
					this.reset();
				},
				click: function(event){
					if (--this.dismiss > -1) 
						return;
					
					var dt = event.timeStamp - this.tEnd;
					if (dt < 400) 
						return;
					
					this.dismiss = 0;
					this.call(event);
				},
				touchmove: function(event) {
					var e = event.touches[0];
					
					var dx = e.clientX - this.startX;
					if (dx < 0) dx *= -1;
					if (dx > threshold_DIST) {
						this.reset();
						return;
					}
					
					var dy = e.clientY - this.startY;
					if (dy < 0) dy *= -1;
					if (dy > threshold_DIST) {
						this.reset();
						return;
					}
				},
				
				reset: function(){
					this.state = 0;
					event_unbind(document.body, 'touchmove', this);
				},
				call: function(event){
					this.reset();
					this.fn(event);
				}
			};
			
		}());
		// end:source ./FastClick.js
		
		TouchHandler = {
			supports: function (type) {
				if (isTouchable === false) {
					return false;
				}
				switch(type){
					case 'click':
					case 'mousedown':
					case 'mouseup':
					case 'mousemove':
						return true;
				}
				return false;
			},
			on: function(el, type, fn){
				if ('click' === type) {
					return new FastClick(el, fn);
				}
				return new Touch(el, type, fn);
			}
		};
	}());
	// end:source /src/touch/Handler.js
	
	// source /src/compo/anchor.js
	/**
	 *	Get component that owns an element
	 **/
	var Anchor;
	(function(){
		Anchor =  {
			create: function(compo){
				var id = compo.ID;
				if (id == null){
					log_warn('Component should have an ID');
					return;
				}
				_cache[id] = compo;
			},
			resolveCompo: function(el, silent){
				if (el == null)
					return null;
				
				var ownerId, id, compo;
				do {
					id = el.getAttribute('x-compo-id');
					if (id != null) {
						if (ownerId == null) {
							ownerId = id;
						}
						compo = _cache[id];
						if (compo != null) {
							compo = Compo.find(compo, {
								key: 'ID',
								selector: ownerId,
								nextKey: 'components'
							});
							if (compo != null) 
								return compo;
						}
					}
					el = el.parentNode;
				}while(el != null && el.nodeType === 1);
	
				// if DEBUG
				ownerId && silent !== true && log_warn('No controller for ID', ownerId);
				// endif
				return null;
			},
			removeCompo: function(compo){
				var id = compo.ID;
				if (id != null) 
					_cache[id] = void 0;
			},
			getByID: function(id){
				return _cache[id];
			}
		};
	
		var _cache = {};
	}());
	
	// end:source /src/compo/anchor.js
	// source /src/compo/Compo.js
	var Compo, CompoProto;
	(function() {
	
		Compo = function () {
			if (this instanceof Compo){
				// used in Class({Base: Compo})
				return void 0;
			}
			
			return compo_create(arguments);
		};
	
		// source ./Compo.static.js
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
				// if DEBUG
				eval(source);
				// endif
			},
			
			Dom: {
				addEventListener: dom_addEventListener
			}
		});
		
		
		// end:source ./Compo.static.js
		// source ./async.js
		(function(){
			Compo.pause = function(compo, ctx){
				if (ctx.defers == null) 
					ctx.defers = [];
				
				ctx.async = true;
				ctx.defers.push(compo);
				
				obj_extend(compo, CompoProto);
				return function(){
					Compo.resume(compo, ctx);
				};
			};
			Compo.resume = function(compo, ctx){
				
				// fn can be null when calling resume synced after pause
				if (compo.resume) 
					compo.resume();
				
				compo.async = false;
				
				var busy = false,
					dfrs = ctx.defers,
					imax = dfrs.length,
					i = -1,
					x;
				while ( ++i < imax ){
					x = dfrs[i];
					
					if (x === compo) {
						dfrs[i] = null;
						continue;
					}
					busy = busy || x != null;
				}
				if (busy === false) 
					ctx.resolve();
			};
			
			var CompoProto = {
				async: true,
				await: function(resume){
					this.resume = resume;
				}
			};
		}());
		// end:source ./async.js
	
		CompoProto = {
			type: Dom.CONTROLLER,
			__resource: null,
			
			ID: null,
			
			tagName: null,
			compoName: null,
			nodes: null,
			components: null,
			expression: null,
			attr: null,
			model: null,
			
			slots: null,
			pipes: null,
			
			compos: null,
			events: null,
			hotkeys: null,
			async: false,
			await: null,
			
			meta: {
				/* render modes, relevant for mask-node */
				mode: null,
				modelMode: null,
				attributes: null,
				serializeNodes: null,
				handleAttributes: null,
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
					
				if (compo_meta_executeAttributeHandler(this, model) === false) {
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
				
				if (this.hotkeys != null) 
					KeyboardHandler.hotkeys(this, this.hotkeys);
				
				
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
				return find_findSingle(
					this, selector_parse(selector, Dom.CONTROLLER, 'down')
				);
			},
			findAll: function(selector){
				return find_findAll(
					this, selector_parse(selector, Dom.CONTROLLER, 'down')
				);
			},
			closest: function(selector){
				return find_findSingle(
					this, selector_parse(selector, Dom.CONTROLLER, 'up')
				);
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
						? _Array_slice.call(arguments, 1)
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
						? _Array_slice.call(arguments, 1)
						: null
				);
				return this;
			}
		};
	
		Compo.prototype = CompoProto;
	}());
	
	// end:source /src/compo/Compo.js
	
	// source /src/signal/exports.js
	(function(){
		
		// source ./utils.js
		var _hasSlot,
			_fire;
			
		(function(){
			// @param sender - event if sent from DOM Event or CONTROLLER instance
			_fire = function (ctr, slot, sender, args, direction) {
				if (ctr == null) 
					return false;
				
				var found = false,
					fn = ctr.slots != null && ctr.slots[slot];
					
				if (typeof fn === 'string') 
					fn = ctr[fn];
				
				if (typeof fn === 'function') {
					found = true;
					
					var isDisabled = ctr.slots.__disabled != null && ctr.slots.__disabled[slot];
					if (isDisabled !== true) {
		
						var result = args == null
							? fn.call(ctr, sender)
							: fn.apply(ctr, [ sender ].concat(args));
		
						if (result === false) {
							return true;
						}
						if (result != null && typeof result === 'object' && result.length != null) {
							args = result;
						}
					}
				}
		
				if (direction === -1 && ctr.parent != null) {
					return _fire(ctr.parent, slot, sender, args, direction) || found;
				}
		
				if (direction === 1 && ctr.components != null) {
					var compos = ctr.components,
						imax = compos.length,
						i = 0,
						r;
					for (; i < imax; i++) {
						r = _fire(compos[i], slot, sender, args, direction);
						
						!found && (found = r);
					}
				}
				
				return found;
			}; // _fire()
		
			_hasSlot = function (ctr, slot, direction, isActive) {
				if (ctr == null) {
					return false;
				}
				var slots = ctr.slots;
				if (slots != null && slots[slot] != null) {
					if (typeof slots[slot] === 'string') {
						slots[slot] = ctr[slots[slot]];
					}
					if (typeof slots[slot] === 'function') {
						if (isActive === true) {
							if (slots.__disabled == null || slots.__disabled[slot] !== true) {
								return true;
							}
						} else {
							return true;
						}
					}
				}
				if (direction === -1 && ctr.parent != null) {
					return _hasSlot(ctr.parent, slot, direction);
				}
				if (direction === 1 && ctr.components != null) {
					for (var i = 0, length = ctr.components.length; i < length; i++) {
						if (_hasSlot(ctr.components[i], slot, direction)) {
							return true;
						}
					}
				}
				return false;
			}; 
		}());
		
		// end:source ./utils.js
		// source ./toggle.js
		var _toggle_all,
			_toggle_single;
		(function(){
			_toggle_all = function (ctr, slot, isActive) {
		
				var parent = ctr,
					previous = ctr;
				while ((parent = parent.parent) != null) {
					__toggle_slotState(parent, slot, isActive);
		
					if (parent.$ == null || parent.$.length === 0) {
						// we track previous for changing elements :disable state
						continue;
					}
		
					previous = parent;
				}
		
				__toggle_slotStateWithChilds(ctr, slot, isActive);
				__toggle_elementsState(previous, slot, isActive);
			};
		
			_toggle_single = function(ctr, slot, isActive) {
				__toggle_slotState(ctr, slot, isActive);
		
				if (!isActive && (_hasSlot(ctr, slot, -1, true) || _hasSlot(ctr, slot, 1, true))) {
					// there are some active slots; do not disable elements;
					return;
				}
				__toggle_elementsState(ctr, slot, isActive);
			};
			
		
			function __toggle_slotState(ctr, slot, isActive) {
				var slots = ctr.slots;
				if (slots == null || slots.hasOwnProperty(slot) === false) {
					return;
				}
				var disabled = slots.__disabled;
				if (disabled == null) {
					disabled = slots.__disabled = {};
				}
				disabled[slot] = isActive === false;
			}
		
			function __toggle_slotStateWithChilds(ctr, slot, isActive) {
				__toggle_slotState(ctr, slot, isActive);
				
				var compos = ctr.components;
				if (compos != null) {
					var imax = compos.length,
						i = 0;
					for(; i < imax; i++) {
						__toggle_slotStateWithChilds(compos[i], slot, isActive);
					}
				}
			}
		
			function __toggle_elementsState(ctr, slot, isActive) {
				if (ctr.$ == null) {
					log_warn('Controller has no elements to toggle state');
					return;
				}
		
				domLib() 
					.add(ctr.$.filter('[data-signals]')) 
					.add(ctr.$.find('[data-signals]')) 
					.each(function(index, node) {
						var signals = node.getAttribute('data-signals');
			
						if (signals != null && signals.indexOf(slot) !== -1) {
							node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
						}
					});
			}
		
			
		
		}());
		// end:source ./toggle.js
		// source ./attributes.js
		(function(){
			
			_create('signal');
			
			_createEvent('change');
			_createEvent('click');
			_createEvent('tap', 'click');
		
			_createEvent('keypress');
			_createEvent('keydown');
			_createEvent('keyup');
			_createEvent('mousedown');
			_createEvent('mouseup');
			
			_createEvent('press', 'keydown');
			_createEvent('shortcut', 'keydown');
			
			function _createEvent(name, type) {
				_create(name, type || name);
			}
			function _create(name, asEvent) {
				mask.registerAttrHandler('x-' + name, 'client', function(node, attrValue, model, ctx, el, ctr){
					_attachListener(el, ctr, attrValue, asEvent);
				});
			}
			
			function _attachListener(el, ctr, definition, asEvent) {
				var arr = definition.split(';'),
					signals = '',
					imax = arr.length,
					i = -1,
					x;
				
				var i_colon,
					i_param,
					event,
					mix,
					param,
					name,
					fn;
					
				while ( ++i < imax ) {
					x = arr[i].trim();
					if (x === '') 
						continue;
					
					mix = param = name = null;
					
					i_colon = x.indexOf(':');
					if (i_colon !== -1) {
						mix = x.substring(0, i_colon);
						i_param = mix.indexOf('(');
						if (i_param !== -1) {
							param = mix.substring(i_param + 1, mix.lastIndexOf(')'));
							mix = mix.substring(0, i_param);
							
							// if DEBUG
							param === '' && log_error('Not valid signal parameter');
							// endif
						}
						x = x.substring(i_colon + 1).trim();
					}
					
					name = x;
					fn = _createListener(ctr, name);
					
					if (asEvent == null) {
						event = mix;
					} else {
						event = asEvent;
						param = mix;
					}
					
					if (!event) {
						log_error('Signal: Eventname is not set', arr[i]);
					}
					if (!fn) {
						log_warn('Slot not found:', name);
						continue;
					}
					
					signals += ',' + name + ',';
					dom_addEventListener(el, event, fn, param, ctr);
				}
				
				if (signals !== '') {
					var attr = el.getAttribute('data-signals');
					el.setAttribute('data-signals', attr + signals);
				}
			}
			
			function _createListener (ctr, slot) {
				if (_hasSlot(ctr, slot, -1) === false) {
					return null;
				}
				return function(event) {
					var args = arguments.length > 1
						? _Array_slice.call(arguments, 1)
						: null;
					_fire(ctr, slot, event, args, -1);
				};
			}
		}());
		// end:source ./attributes.js
		
		obj_extend(Compo, {
			signal: {
				toggle: _toggle_all,
	
				// to parent
				emitOut: function(controller, slot, sender, args) {
					var captured = _fire(controller, slot, sender, args, -1);
					
					// if DEBUG
					!captured && log_warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
					// endif
					
				},
				// to children
				emitIn: function(controller, slot, sender, args) {
					_fire(controller, slot, sender, args, 1);
				},
	
				enable: function(controller, slot) {
					_toggle_all(controller, slot, true);
				},
				
				disable: function(controller, slot) {
					_toggle_all(controller, slot, false);
				}
			},
			slot: {
				toggle: _toggle_single,
				enable: function(controller, slot) {
					_toggle_single(controller, slot, true);
				},
				disable: function(controller, slot) {
					_toggle_single(controller, slot, false);
				},
				invoke: function(controller, slot, event, args) {
					var slots = controller.slots;
					if (slots == null || typeof slots[slot] !== 'function') {
						log_error('Slot not found', slot, controller);
						return null;
					}
	
					if (args == null) {
						return slots[slot].call(controller, event);
					}
	
					return slots[slot].apply(controller, [event].concat(args));
				},
	
			}
	
		});
		
	}());
	// end:source /src/signal/exports.js

	// source /src/DomLite.js
	/*
	 * Extrem simple Dom Library. If (jQuery | Kimbo | Zepto) is not used.
	 * Only methods, required for the Compo library are implemented.
	 */
	var DomLite;
	(function(document){
		if (document == null) 
			return;
		
		Compo.DomLite = DomLite = function(els){
			if (this instanceof DomLite === false) 
				return new DomLite(els);
			
			return this.add(els)
		};
		
		if (domLib == null) 
			domLib = DomLite;
		
		var Proto = DomLite.fn = {
			constructor: DomLite,
			length: 0,
			add: function(mix){
				if (mix == null) 
					return this;
				if (is_Array(mix) === true) 
					return each(mix, this.add, this);
				
				var type = mix.nodeType;
				if (type === 11 /* Node.DOCUMENT_FRAGMENT_NODE */)
					return each(mix.childNodes, this.add, this);
					
				if (type == null) {
					if (typeof mix.length === 'number') 
						return each(mix, this.add, this);
					
					log_warn('Uknown domlite object');
					return this;
				}
				
				this[this.length++] = mix;
				return this;
			},
			on: function(){
				return binder.call(this, on, delegate, arguments);
			},
			off: function(){
				return binder.call(this, off, undelegate, arguments);
			},
			find: function(sel){
				return each(this, function(node){
					this.add(_$$.call(node, sel));
				}, new DomLite);
			},
			filter: function(sel){
				return each(this, function(node, index){
					_is(node, sel) === true && this.add(node);
				}, new DomLite);
			},
			parent: function(){
				var x = this[0];
				return new DomLite(x && x.parentNode);
			},
			children: function(sel){
				var set = each(this, function(node){
					this.add(node.childNodes);
				}, new DomLite);
				return sel == null ? set : set.filter(sel);
			},
			closest: function(selector){
				var x = this[0],
					dom = new DomLite;
				while( x != null && x.parentNode != null){
					x = x.parentNode;
					if (_is(x, selector)) 
						return dom.add(x);
				}
				return dom;
			},
			remove: function(){
				return each(this, function(x){
					x.parentNode.removeChild(x);
				});
			},
			text: function(mix){
				if (arguments.length === 0) {
					return aggr('', this, function(txt, x){
						return txt + x.textContent;
					});
				}
				return each(this, function(x){
					x.textContent = mix;
				});
			},
			html: function(mix){
				if (arguments.length === 0) {
					return aggr('', this, function(txt, x){
						return txt + x.innerHTML;
					});
				}
				return each(this, function(x){
					x.innerHTML = mix;
				});
			},
			val: function(mix){
				if (arguments.length === 0) {
					return this.length === 0 ? null : this[0].value;
				}
				if (this.length !== 0) {
					this[0].value = mix;
				}
				return this;
			}
		};
		
		(function(){
			var Manip = {
				append: function(node, el){
					after_(node, node.lastChild, el);
				},
				prepend: function(node, el){
					before_(node, node.firstChild, el);
				},
				after: function(node, el){
					after_(node.parentNode, node, el);
				},
				before: function(node, el){
					before_(node.parentNode, node, el);
				}
			};
			each(['append', 'prepend', 'before', 'after'], function(method){
				var fn = Manip[method];
				Proto[method] = function(mix){
					var isArray = is_Array(mix);
					return each(this, function(node){
						if (isArray) {
							each(mix, function(el){
								fn(node, el);
							});
							return;
						}
						fn(node, mix);
					});
				};
			});
			function before_(parent, anchor, el){
				if (parent == null || el == null)
					return;
				parent.insertBefore(el, anchor);
			}
			function after_(parent, anchor, el) {
				var next = anchor != null ? anchor.nextSibling : null;
				before_(parent, next, el);
			}
		}());
		
		
		function each(arr, fn, ctx){
			if (arr == null) 
				return ctx || arr;
			var imax = arr.length,
				i = -1;
			while( ++i < imax ){
				fn.call(ctx || arr, arr[i], i);
			}
			return ctx || arr;
		}
		function aggr(seed, arr, fn, ctx) {
			each(arr, function(x, i){
				seed = fn.call(ctx || arr, seed, arr[i], i);
			});
			return seed;
		}
		function indexOf(arr, fn, ctx){
			if (arr == null) 
				return -1;
			var imax = arr.length,
				i = -1;
			while( ++i < imax ){
				if (fn.call(ctx || arr, arr[i], i) === true)
					return i;
			}
			return -1;
		}
		
		var docEl = document.documentElement;
		var _$$ = docEl.querySelectorAll;
		var _is = (function(){
			var matchesSelector =
				docEl.webkitMatchesSelector ||
				docEl.mozMatchesSelector ||
				docEl.msMatchesSelector ||
				docEl.oMatchesSelector ||
				docEl.matchesSelector
			;
			return function (el, selector) {
				return el == null || el.nodeType !== 1
					? false
					: matchesSelector.call(el, selector);
			};	
		}());
		
		/* Events */
		var binder, on, off, delegate, undelegate;
		(function(){
			binder = function(bind, bindSelector, args){
				var length = args.length,
					fn;
				if (2 === length) 
					fn = bind
				if (3 === length) 
					fn = bindSelector;
				
				if (fn != null) {
					return each(this, function(node){
						fn.apply(DomLite(node), args);
					});
				}
				log_error('`DomLite.on|off` - invalid arguments count');
				return this;
			};
			on = function(type, fn){
				return run(this, _addEvent, type, fn);
			};
			off = function(type, fn){
				return run(this, _remEvent, type, fn);
			};
			delegate = function(type, selector, fn){
				function guard(event){
					var el = event.target,
						current = event.currentTarget;
					if (current === el) 
						return;
					while(el != null && el !== current){
						if (_is(el, selector)) {
							fn(event);
							return;
						}
						el = el.parentNode;
					}
				}
				(fn._guards || (fn._guards = [])).push(guard);
				return on.call(this, type, guard);
			};
			undelegate = function(type, selector, fn){
				return each(fn._quards, function(guard){
					off.call(this, type, guard);
				}, this);
			};
			
			function run(set, handler, type, fn){
				return each(set, function(node){
					handler.call(node, type, fn, false);
				});
			}
			var _addEvent = docEl.addEventListener,
				_remEvent = docEl.removeEventListener;
		}());
		
		/* class handler */
		(function(){
			var isClassListSupported = docEl.classList != null;
			var hasClass = isClassListSupported === true
				? function (node, klass) {
					return node.classList.contains(klass);
				}
				: function(node, klass) {
					return -1 !== (' ' + node.className + ' ').indexOf(' ' + klass + ' ');
				};
			Proto.hasClass = function(klass){
				return -1 !== indexOf(this, function(node){
					return hasClass(node, klass)
				});
			};
			var Shim;
			(function(){
				Shim = {
					add: function(node, klass){
						if (hasClass(node, klass) === false) 
							add(node, klass);
					},
					remove: function(node, klass){
						if (hasClass(node, klass) === true) 
							remove(node, klass);
					},
					toggle: function(node, klass){
						var fn = hasClass(node, klass) === true
							? remove
							: add;
						fn(node, klass);
					}
				};
				function add(node, klass){
					node.className += ' ' + klass;
				}
				function remove(node, klass){
					node.className = (' ' + node.className + ' ').replace(' ' + klass + ' ', ' ');
				}
			}());
			
			each(['add', 'remove', 'toggle'], function(method){
				var mutatorFn = isClassListSupported === false
					? Shim[method]
					: function(node, klass){
						var classList = node.classList;
						classList[method].call(classList, klass);
					};
				Proto[method + 'Class'] = function(klass){
					return each(this, function(node){
						mutatorFn(node, klass);
					});
				};
			});
				
		}());
		
		
		// Events
		(function(){
			var createEvent = function(type){
				var event = document.createEvent('Event');
				event.initEvent(type, true, true);
				return event;
			};
			var create = function(type, data){
				if (data == null) 
					return createEvent(type);
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent(type, true, true, data);
				return event;
			};
			var dispatch = function(node, event){
				node.dispatchEvent(event);
			};
			Proto['trigger'] = function(type, data){
				var event = create(type, data);
				return each(this, function(node){
					dispatch(node, event);
				});
			};
		}());
		
		// Attributes
		(function(){
			Proto['attr'] = function(name, val){
				if (val === void 0) 
					return this[0] && this[0].getAttribute(name);
				return each(this, function(node){
					node.setAttribute(name, val);
				});
			};
			Proto['removeAttr'] = function(name){
				return each(this, function(node){
					node.removeAttribute(name);
				});
			};
		}());
		
		if (Object.setPrototypeOf) 
			Object.setPrototypeOf(Proto, Array.prototype);
		else if (Proto.__proto__) 
			Proto.__proto__ = Array.prototype;
		
		DomLite.prototype = Proto;
		domLib_initialize();
		
	}(global.document));
	// end:source /src/DomLite.js
	// source /src/jcompo/jCompo.js
	// try to initialize the dom lib, or is then called from `setDOMLibrary`
	domLib_initialize();
	
	function domLib_initialize(){
		if (domLib == null || domLib.fn == null)
			return;
		
		domLib.fn.compo = function(selector){
			if (this.length === 0)
				return null;
			
			var compo = Anchor.resolveCompo(this[0], true);
	
			return selector == null
				? compo
				: find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
		};
	
		domLib.fn.model = function(selector){
			var compo = this.compo(selector);
			if (compo == null)
				return null;
			
			var model = compo.model;
			while(model == null && compo.parent){
				compo = compo.parent;
				model = compo.model;
			}
			return model;
		};
		
		// insert
		(function(){
			var jQ_Methods = [
				'append',
				'prepend',
				'before',
				'after'
			];
			
			[
				'appendMask',
				'prependMask',
				'beforeMask',
				'afterMask'
			].forEach(function(method, index){
				
				domLib.fn[method] = function(template, model, ctr, ctx){
					if (this.length === 0) {
						// if DEBUG
						log_warn('<jcompo> $.', method, '- no element was selected(found)');
						// endif
						return this;
					}
					if (this.length > 1) {
						// if DEBUG
						log_warn('<jcompo> $.', method, ' can insert only to one element. Fix is comming ...');
						// endif
					}
					if (ctr == null) {
						ctr = index < 2
							? this.compo()
							: this.parent().compo()
							;
					}
					
					var isUnsafe = false;
					if (ctr == null) {
						ctr = {};
						isUnsafe = true;
					}
					
					
					if (ctr.components == null) {
						ctr.components = [];
					}
					
					var compos = ctr.components,
						i = compos.length,
						fragment = mask.render(template, model, ctx, null, ctr);
					
					var self = this[jQ_Methods[index]](fragment),
						imax = compos.length;
					
					for (; i < imax; i++) {
						Compo.signal.emitIn(compos[i], 'domInsert');
					}
					
					if (isUnsafe && imax !== 0) {
						// if DEBUG
						log_warn(
							'$.'
							, method
							, '- parent controller was not found in Elements DOM.'
							, 'This can lead to memory leaks.'
						);
						log_warn(
							'Specify the controller directly, via $.'
							, method
							, '(template[, model, controller, ctx])'
						);
						// endif
					}
					
					return self;
				};
				
			});
		}());
		
		
		// remove
		(function(){
			var jq_remove = domLib.fn.remove,
				jq_empty = domLib.fn.empty
				;
			
			domLib.fn.removeAndDispose = function(){
				this.each(each_tryDispose);
				
				return jq_remove.call(this);
			};
			
			domLib.fn.emptyAndDispose = function(){
				this.each(each_tryDisposeChildren);
				
				return jq_empty.call(this);
			}
			
			
			function each_tryDispose(index, node){
				node_tryDispose(node);
			}
			
			function each_tryDisposeChildren(index, node){
				node_tryDisposeChildren(node);
			}
			
		}());
	}
	
	// end:source /src/jcompo/jCompo.js

	// source /src/handler/slot.js
	
	function SlotHandler() {}
	
	mask.registerHandler(':slot', SlotHandler);
	
	SlotHandler.prototype = {
		constructor: SlotHandler,
		renderEnd: function(element, model, cntx, container){
			this.slots = {};
	
			this.expression = this.attr.on;
	
			this.slots[this.attr.signal] = this.handle;
		},
		handle: function(){
			var expr = this.expression;
	
			mask.Utils.Expression.eval(expr, this.model, global, this);
		}
	};
	
	// end:source /src/handler/slot.js


	return Compo;
}));
