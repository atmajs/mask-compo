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
	var mask_merge = mask.merge;
	var reporter_createErrorNode = function(msg){
		return mask.parse(".-mask-compo-errored > '''" + msg + "'''");;
	}

	// source /ref-utils/lib/utils.embed.js
	// source /src/refs.js
	var _Array_slice = Array.prototype.slice,
		_Array_splice = Array.prototype.splice,
		_Array_indexOf = Array.prototype.indexOf,
		
		_Object_create = null, // in obj.js
		_Object_hasOwnProp = Object.hasOwnProperty,
		_Object_getOwnProp = Object.getOwnPropertyDescriptor,
		_Object_defineProperty = Object.defineProperty;
	// end:source /src/refs.js
	
	// source /src/coll.js
	var coll_each,
		coll_remove,
		coll_map,
		coll_indexOf,
		coll_find;
	(function(){
		coll_each = function(coll, fn, ctx){
			if (ctx == null) 
				ctx = coll;
			if (coll == null) 
				return coll;
			
			var imax = coll.length,
				i = 0;
			for(; i< imax; i++){
				fn.call(ctx, coll[i], i);
			}
			return ctx;
		};
		coll_indexOf = function(coll, x){
			if (coll == null) 
				return -1;
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (coll[i] === x) 
					return i;
			}
			return -1;
		};
		coll_remove = function(coll, x){
			var i = coll_indexOf(coll, x);
			if (i === -1) 
				return false;
			coll.splice(i, 1);
			return true;
		};
		coll_map = function(coll, fn, ctx){
			var arr = new Array(coll.length);
			coll_each(coll, function(x, i){
				arr[i] = fn.call(this, x, i);
			}, ctx);
			return arr;
		};
		coll_find = function(coll, fn, ctx){
			var imax = coll.length,
				i = 0;
			for(; i < imax; i++){
				if (fn.call(ctx || coll, coll[i], i))
					return true;
			}
			return false;
		};
	}());
	// end:source /src/coll.js
	
	// source /src/polyfill/arr.js
	if (Array.prototype.forEach === void 0) {
		Array.prototype.forEach = function(fn, ctx){
			coll_each(this, fn, ctx);
		};
	}
	if (Array.prototype.indexOf === void 0) {
		Array.prototype.indexOf = function(x){
			return coll_indexOf(this, x);
		};
	}
	
	// end:source /src/polyfill/arr.js
	// source /src/polyfill/str.js
	if (String.prototype.trim == null){
		String.prototype.trim = function(){
			var start = -1,
				end = this.length,
				code;
			if (end === 0) 
				return this;
			while(++start < end){
				code = this.charCodeAt(start);
				if (code > 32)
					break;
			}
			while(--end !== 0){
				code = this.charCodeAt(end);
				if (code > 32)
					break;
			}
			return start !== 0 && end !== length - 1
				? this.substring(start, end + 1)
				: this;
		};
	}
	// end:source /src/polyfill/str.js
	// source /src/polyfill/fn.js
	
	if (Function.prototype.bind == null) {
		var _Array_slice;
		Function.prototype.bind = function(){
			if (arguments.length < 2 && typeof arguments[0] === "undefined") 
				return this;
			var fn = this,
				args = _Array_slice.call(arguments),
				ctx = args.shift();
			return function() {
				return fn.apply(ctx, args.concat(_Array_slice.call(arguments)));
			};
		};
	}
	// end:source /src/polyfill/fn.js
	
	// source /src/is.js
	var is_Function,
		is_Array,
		is_ArrayLike,
		is_String,
		is_Object,
		is_notEmptyString,
		is_rawObject,
		is_NODE,
		is_DOM;
	
	(function() {
		is_Function = function(x) {
			return typeof x === 'function';
		};
		is_Object = function(x) {
			return x != null && typeof x === 'object';
		};
		is_Array = is_ArrayLike = function(arr) {
			return arr != null
				&& typeof arr === 'object'
				&& typeof arr.length === 'number'
				&& typeof arr.slice === 'function'
				;
		};
		is_String = function(x) {
			return typeof x === 'string';
		};
		is_notEmptyString = function(x) {
			return typeof x === 'string' && x !== '';
		};
		is_rawObject = function(obj) {
			if (obj == null || typeof obj !== 'object')
				return false;
	
			return obj.constructor === Object;
		};
	
		is_DOM = typeof window !== 'undefined' && window.navigator != null;
		is_NODE = !is_DOM;
		
	}());
	// end:source /src/is.js
	// source /src/obj.js
	var obj_getProperty,
		obj_setProperty,
		obj_hasProperty,
		obj_extend,
		obj_extendDefaults,
		obj_extendMany,
		obj_extendProperties,
		obj_create,
		obj_toFastProps,
		obj_defineProperty;
	(function(){
		obj_getProperty = function(obj_, path){
			if ('.' === path) // obsolete
				return obj_;
			
			var obj = obj_,
				chain = path.split('.'),
				imax = chain.length,
				i = -1;
			while ( obj != null && ++i < imax ) {
				obj = obj[chain[i]];
			}
			return obj;
		};
		obj_setProperty = function(obj_, path, val) {
			var obj = obj_,
				chain = path.split('.'),
				imax = chain.length - 1,
				i = -1,
				key;
			while ( ++i < imax ) {
				key = chain[i];
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
			obj[chain[i]] = val;
		};
		obj_hasProperty = function(obj, path) {
			var x = obj_getProperty(obj, path);
			return x !== void 0;
		};
		obj_defineProperty = function(obj, path, dscr) {
			var x = obj,
				chain = path.split('.'),
				imax = chain.length - 1,
				i = -1, key;
			while (++i < imax) {
				key = chain[i];
				if (x[key] == null) 
					x[key] = {};
				x = x[key];
			}
			key = chain[imax];
			if (_Object_defineProperty) {
				if (dscr.writable     === void 0) dscr.writable     = true;
				if (dscr.configurable === void 0) dscr.configurable = true;
				if (dscr.enumerable   === void 0) dscr.enumerable   = true;
				_Object_defineProperty(x, key, dscr);
				return;
			}
			x[key] = dscr.value === void 0
				? dscr.value
				: (dscr.get && dscr.get());
		};
		obj_extend = function(a, b){
			if (b == null)
				return a || {};
			
			if (a == null)
				return obj_create(b);
			
			for(var key in b){
				a[key] = b[key];
			}
			return a;
		};
		obj_extendDefaults = function(a, b){
			if (b == null) 
				return a || {};
			if (a == null) 
				return obj_create(b);
			
			for(var key in b) {
				if (a[key] == null) 
					a[key] = b[key];
			}
			return a;
		}
		obj_extendProperties = (function(){
			if (_Object_getOwnProp == null) 
				return obj_extend;
			
			return function(a, b){
				if (b == null)
					return a || {};
				
				if (a == null)
					return obj_create(b);
				
				var key, descr;
				for(key in b){
					descr = _Object_getOwnProp(b, key);
					if (descr == null) 
						continue;
					
					if (descr.hasOwnProperty('value')) {
						a[key] = descr.value;
						continue;
					}
					_Object_defineProperty(a, key, descr);
				}
				return a;
			};
		}());
		obj_extendMany = function(a){
			var imax = arguments.length,
				i = 1;
			for(; i<imax; i++) {
				a = obj_extend(a, arguments[i]);
			}
			return a;
		};
		obj_toFastProps = function(obj){
			/*jshint -W027*/
			function F() {}
			F.prototype = obj;
			new F();
			return;
			eval(obj);
		};
		_Object_create = obj_create = Object.create || function(x) {
			var Ctor = function(){};
			Ctor.prototype = x;
			return new Ctor;
		};
	}());
	// end:source /src/obj.js
	// source /src/arr.js
	var arr_remove,
		arr_each,
		arr_indexOf,
		arr_contains,
		arr_pushMany;
	(function(){
		arr_remove = function(array, x){
			var i = array.indexOf(x);
			if (i === -1) 
				return false;
			array.splice(i, 1);
			return true;
		};
		arr_each = function(arr, fn, ctx){
			arr.forEach(fn, ctx);
		};
		arr_indexOf = function(arr, x){
			return arr.indexOf(x);
		};
		arr_contains = function(arr, x){
			return arr.indexOf(x) !== -1;
		};
		arr_pushMany = function(arr, arrSource){
			if (arrSource == null || arr == null || arr === arrSource) 
				return;
			
			var il = arr.length,
				jl = arrSource.length,
				j = -1
				;
			while( ++j < jl ){
				arr[il + j] = arrSource[j];
			}
		};
	}());
	// end:source /src/arr.js
	// source /src/fn.js
	var fn_proxy,
		fn_apply,
		fn_doNothing;
	(function(){
		fn_proxy = function(fn, ctx) {
			return function(){
				return fn_apply(fn, ctx, arguments);
			};
		};
		
		fn_apply = function(fn, ctx, args){
			var l = args.length;
			if (0 === l) 
				return fn.call(ctx);
			if (1 === l) 
				return fn.call(ctx, args[0]);
			if (2 === l) 
				return fn.call(ctx, args[0], args[1]);
			if (3 === l) 
				return fn.call(ctx, args[0], args[1], args[2]);
			if (4 === l)
				return fn.call(ctx, args[0], args[1], args[2], args[3]);
			
			return fn.apply(ctx, args);
		};
		
		fn_doNothing = function(){
			return false;
		};
	}());
	// end:source /src/fn.js
	// source /src/str.js
	var str_format;
	(function(){
		str_format = function(str_){
			var str = str_,
				imax = arguments.length,
				i = 0, x;
			while ( ++i < imax ){
				x = arguments[i];
				if (is_Object(x) && x.toJSON) {
					x = x.toJSON();
				}
				str_ = str_.replace(rgxNum(i - 1), String(x));
			}
			
			return str_;
		};
		
		var rgxNum;
		(function(){
			rgxNum = function(num){
				return cache_[num] || (cache_[num] = new RegExp('\\{' + num + '\\}', 'g'));
			};
			var cache_ = {};
		}());
	}());
	// end:source /src/str.js
	// source /src/class.js
	/**
	 * create([...Base], Proto)
	 * Base: Function | Object
	 * Proto: Object {
	 *    constructor: ?Function
	 *    ...
	 */
	var class_create,
	
		// with property accessor functions support
		class_createEx;
	(function(){
		
		class_create = function(){
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null) 
				Proto = {};
			
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function ClassCtor () {};
			
			var i = args.length,
				BaseCtor, x;
			while ( --i > -1 ) {
				x = args[i];
				if (typeof x === 'function') {
					BaseCtor = wrapFn(x, BaseCtor);
					x = x.prototype;
				}
				obj_extendDefaults(Proto, x);
			}
			return createClass(wrapFn(BaseCtor, Ctor), Proto);
		};
		class_createEx = function(){
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null) 
				Proto = {};
			
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function () {};
				
			var imax = args.length,
				i = -1,
				BaseCtor, x;
			while ( ++i < imax ) {
				x = args[i];
				if (typeof x === 'function') {
					BaseCtor = wrapFn(BaseCtor, x);
					x = x.prototype;
				}
				obj_extendProperties(Proto, x);
			}
			return createClass(wrapFn(BaseCtor, Ctor), Proto);
		};
		
		function createClass(Ctor, Proto) {
			Proto.constructor = Ctor;
			Ctor.prototype = Proto;
			return Ctor;
		}
		function wrapFn(fnA, fnB) {
			if (fnA == null) {
				return fnB;
			}
			if (fnB == null) {
				return fnA;
			}
			return function(){
				var args = _Array_slice.call(arguments);
				var x = fnA.apply(this, args);
				if (x !== void 0) 
					return x;
				
				return fnB.apply(this, args);
			};
		}
	}());
	// end:source /src/class.js
	// source /src/error.js
	var error_createClass,
		error_formatSource,
		error_formatCursor,
		error_cursor;
		
	(function(){
		error_createClass = function(name, Proto, stackSliceFrom){
			var Ctor = _createCtor(Proto, stackSliceFrom);
			Ctor.prototype = new Error;
			
			Proto.constructor = Error;
			Proto.name = name;
			obj_extend(Ctor.prototype, Proto);
			return Ctor;
		};
		
		error_formatSource = function(source, index, filename) {
			var cursor  = error_cursor(source, index),
				lines   = cursor[0],
				lineNum = cursor[1],
				rowNum  = cursor[2],
				str = '';
			if (filename != null) {
				str += str_format(' at {0}({1}:{2})\n', filename, lineNum, rowNum);
			}
			return str + error_formatCursor(lines, lineNum, rowNum);
		};
		
		/**
		 * @returns [ lines, lineNum, rowNum ]
		 */
		error_cursor = function(str, index){
			var lines = str.substring(0, index).split('\n'),
				line = lines.length,
				row = index + 1 - lines.slice(0, line - 1).join('\n').length;
			if (line > 1) {
				// remote trailing newline
				row -= 1;
			}
			return [str.split('\n'), line, row];
		};
		
		(function(){
			error_formatCursor = function(lines, lineNum, rowNum) {
					
				var BEFORE = 3,
					AFTER  = 2,
					i = lineNum - BEFORE,
					imax   = i + BEFORE + AFTER,
					str  = '';
				
				if (i < 0) i = 0;
				if (imax > lines.length) imax = lines.length;
				
				var lineNumberLength = String(imax).length,
					lineNumber;
				
				for(; i < imax; i++) {
					if (str)  str += '\n';
					
					lineNumber = ensureLength(i + 1, lineNumberLength);
					str += lineNumber + '|' + lines[i];
					
					if (i + 1 === lineNum) {
						str += '\n' + repeat(' ', lineNumberLength + 1);
						str += lines[i].substring(0, rowNum - 1).replace(/[^\s]/g, ' ');
						str += '^';
					}
				}
				return str;
			};
			
			function ensureLength(num, count) {
				var str = String(num);
				while(str.length < count) {
					str += ' ';
				}
				return str;
			}
			function repeat(char_, count) {
				var str = '';
				while(--count > -1) {
					str += char_;
				}
				return str;
			}
		}());
		
		function _createCtor(Proto, stackFrom){
			var Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: null;
				
			return function(){
				obj_defineProperty(this, 'stack', {
					value: _prepairStack(stackFrom || 3)
				});
				obj_defineProperty(this, 'message', {
					value: str_format.apply(this, arguments)
				});
				if (Ctor != null) {
					Ctor.apply(this, arguments);
				}
			};
		}
		
		function _prepairStack(sliceFrom) {
			var stack = new Error().stack;
			return stack == null ? null : stack
				.split('\n')
				.slice(sliceFrom)
				.join('\n');
		}
		
	}());
	// end:source /src/error.js
	
	// source /src/class/Dfr.js
	var class_Dfr;
	(function(){
		class_Dfr = function(){};
		class_Dfr.prototype = {
			_isAsync: true,
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
			
			defer: function(){
				this._rejected = null;
				this._resolved = null;
				return this;
			},
			isResolved: function(){
				return this._resolved != null;
			},
			isRejected: function(){
				return this._rejected != null;
			},
			isBusy: function(){
				return this._resolved == null && this._rejected == null;
			},
			resolve: function() {
				var done = this._done,
					always = this._always
					;
				
				this._resolved = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(done, this, arguments);
				arr_callOnce(always, this, [ this ]);
				
				return this;
			},
			reject: function() {
				var fail = this._fail,
					always = this._always
					;
				
				this._rejected = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(fail, this, arguments);
				arr_callOnce(always, this, [ this ]);	
				return this;
			},
			then: function(filterSuccess, filterError){
				return this.pipe(filterSuccess, filterError);
			},
			done: function(callback) {
				if (this._rejected != null) 
					return this;
				return dfr_bind(
					this,
					this._resolved,
					this._done || (this._done = []),
					callback
				);
			},
			fail: function(callback) {
				if (this._resolved != null) 
					return this;
				return dfr_bind(
					this,
					this._rejected,
					this._fail || (this._fail = []),
					callback
				);
			},
			always: function(callback) {
				return dfr_bind(
					this,
					this._rejected || this._resolved,
					this._always || (this._always = []),
					callback
				);
			},
			pipe: function(mix /* ..methods */){
				var dfr;
				if (typeof mix === 'function') {
					dfr = new class_Dfr;
					var done_ = mix,
						fail_ = arguments.length > 1
							? arguments[1]
							: null;
						
					this
						.done(delegate(dfr, 'resolve', done_))
						.fail(delegate(dfr, 'reject',  fail_))
						;
					return dfr;
				}
				
				dfr = mix;
				var imax = arguments.length,
					done = imax === 1,
					fail = imax === 1,
					i = 0, x;
				while( ++i < imax ){
					x = arguments[i];
					switch(x){
						case 'done':
							done = true;
							break;
						case 'fail':
							fail = true;
							break;
						default:
							console.error('Unsupported pipe channel', arguments[i])
							break;
					}
				}
				done && this.done(delegate(dfr, 'resolve'));
				fail && this.fail(delegate(dfr, 'reject' ));
				
				function pipe(dfr, method) {
					return function(){
						dfr[method].apply(dfr, arguments);
					};
				}
				function delegate(dfr, name, fn) {
					return function(){
						if (fn != null) {
							var override = fn.apply(this, arguments);
							if (override != null) {
								if (isDeferred(override) === true) {
									override.pipe(dfr);
									return;
								}
								
								dfr[name](override)
								return;
							}
						}
						dfr[name].apply(dfr, arguments);
					};
				}
				
				return this;
			},
			pipeCallback: function(){
				var self = this;
				return function(error){
					if (error != null) {
						self.reject(error);
						return;
					}
					var args = _Array_slice.call(arguments, 1);
					fn_apply(self.resolve, self, args);
				};
			}
		};
		
		class_Dfr.run = function(fn, ctx){
			var dfr = new class_Dfr();
			if (ctx == null) 
				ctx = dfr;
			
			fn.call(
				ctx
				, fn_proxy(dfr.resolve, ctx)
				, fn_proxy(dfr.reject, dfr)
				, dfr
			);
			return dfr;
		};
		
		// PRIVATE
		
		function dfr_bind(dfr, arguments_, listeners, callback){
			if (callback == null) 
				return dfr;
			
			if ( arguments_ != null) 
				fn_apply(callback, dfr, arguments_);
			else 
				listeners.push(callback);
			
			return dfr;
		}
		
		function dfr_clearListeners(dfr) {
			dfr._done = null;
			dfr._fail = null;
			dfr._always = null;
		}
		
		function arr_callOnce(arr, ctx, args) {
			if (arr == null) 
				return;
			
			var imax = arr.length,
				i = -1,
				fn;
			while ( ++i < imax ) {
				fn = arr[i];
				
				if (fn) 
					fn_apply(fn, ctx, args);
			}
			arr.length = 0;
		}
		function isDeferred(x){
			if (x == null || typeof x !== 'object') 
				return false;
			
			if (x instanceof class_Dfr) 
				return true;
			
			return typeof x.done === 'function'
				&& typeof x.fail === 'function'
				;
		}
	}());
	// end:source /src/class/Dfr.js
	// source /src/class/EventEmitter.js
	var class_EventEmitter;
	(function(){
	 
		class_EventEmitter = function() {
			this._listeners = {};
		};
	    class_EventEmitter.prototype = {
	        on: function(event, fn) {
	            if (fn != null){
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
				}
	            return this;
	        },
	        once: function(event, fn){
				if (fn != null) {
					fn._once = true;
					(this._listeners[event] || (this._listeners[event] = [])).push(fn);
				}
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					args;
				return function(){
					args = _Array_slice.call(arguments);
					args.unshift(event);
					fn_apply(that.trigger, that, args);
				};
			},
	        
			emit: event_trigger,
	        trigger: event_trigger,
			
	        off: function(event, fn) {
				var listeners = this._listeners[event];
	            if (listeners == null)
					return this;
				
				if (arguments.length === 1) {
					listeners.length = 0;
					return this;
				}
				
				var imax = listeners.length,
					i = -1;
				while (++i < imax) {
					
					if (listeners[i] === fn) {
						listeners.splice(i, 1);
						i--;
						imax--;
					}
					
				}
	            return this;
			}
	    };
	    
		function event_trigger() {
			var args = _Array_slice.call(arguments),
				event = args.shift(),
				fns = this._listeners[event],
				fn, imax, i = 0;
				
			if (fns == null)
				return this;
			
			for (imax = fns.length; i < imax; i++) {
				fn = fns[i];
				fn_apply(fn, this, args);
				
				if (fn._once === true){
					fns.splice(i, 1);
					i--;
					imax--;
				}
			}
			return this;
		}
	}());
	
	// end:source /src/class/EventEmitter.js
	
	
	// end:source /ref-utils/lib/utils.embed.js

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
				case '[':
					var matches = /(\w+)\s*=([^\]]+)/.exec(selector);
					if (matches == null) {
						throw Error('Invalid attributes selector: ' + selector);
					}
					key = matches[1];
					selector = matches[2].trim();
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
	
		compo_meta_toAttributeKey,
		compo_meta_prepairAttributesHandler
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
	
		// == Meta Attribute Handler
		(function(){
	
			compo_meta_prepairAttributesHandler = function(Proto){
				var meta = Proto.meta;
				if (meta == null) {
					meta = Proto.meta = {
						attributes: null,
						cache: null,
						mode: null,
						readAttributes: null,
					};
				}
	
				var attributes = meta.attributes;
				if (attributes == null) {
					meta.readAttributes = null;
					return;
				}
	
				var hash = {},
					key, val;
				for(key in attributes) {
					val = attributes[key];
					_attr_setProperty_Delegate(Proto, key, val, /*out*/ hash);
				}
				meta.readAttributes = _attr_setProperties_Delegate(hash);
			};
	
			compo_meta_toAttributeKey = _getProperty;
	
			function _attr_setProperties_Delegate(hash){
				return function(compo, attr, model, container){
					var key, fn, val, error;
					for(key in hash){
						fn    = hash[key];
						val   = attr[key];
						error = fn(compo, key, val, model, container);
	
						if (error == null)
							continue;
	
						_errored(compo, error, key, val)
						return false;
					}
					return true;
				};
			}
			function _attr_setProperty_Delegate(Proto, metaKey, metaVal, /*out*/hash) {
				var optional = metaKey.charCodeAt(0) === 63, // ?
					default_ = null,
					attrName = optional
						? metaKey.substring(1)
						: metaKey;
	
				var property = _getProperty(attrName),
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
	
				Proto[property] = null;
				Proto = null;
				hash [attrName] = function(compo, attrName, attrVal, model, container){
					if (attrVal == null) {
						if (optional === false) {
							return Error('Expected');
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
				key,
				hasBase;
	
			if (argLength > 1)
				hasBase = compo_inherit(Proto, _Array_slice.call(arguments_, 0, argLength - 1));
	
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
	
			compo_meta_prepairAttributesHandler(Proto);
	
			Ctor = Proto.hasOwnProperty('constructor')
				? Proto.constructor
				: function CompoBase() {}
				;
	
			Ctor = compo_createConstructor(Ctor, Proto, hasBase);
	
			for(key in CompoProto){
				if (Proto[key] == null)
					Proto[key] = CompoProto[key];
			}
	
			Ctor.prototype = Proto;
			Proto = null;
			return Ctor;
		};
	
		compo_createConstructor = function(Ctor, proto, hasBaseAlready) {
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
	
				if (hasBaseAlready === true) {
					return;
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
	(function(){
		var COMPO_CTOR_NAME = 'CompoBase';
		
		compo_inherit = function(Proto, Extends){
			var imax = Extends.length,
				i = imax,
				ctors = [],
				x, hasBase;
			while( --i > -1){
				x = Extends[i];
				if (typeof x === 'string') {
					x = mask.getHandler(x);
					if (x != null && x.name === 'Resolver') {
						log_error('Inheritance error: private component');
						x = null;
					}
				}
				if (x == null) {
					log_error('Base component not defined', Extends[i]);
					continue;
				}
				if (typeof x === 'function') {
					hasBase = hasBase || x.name === COMPO_CTOR_NAME;
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
				
			return hasBase;
		};
		
		function inherit_(target, source, name){
			if (target == null || source == null) 
				return;
			
			if ('node' === name) {
				var targetNodes = target.template || target.nodes,
					sourceNodes = source.template || source.nodes;
				target.template = targetNodes == null || sourceNodes == null
					? (targetNodes || sourceNodes)
					: (mask_merge(sourceNodes, targetNodes, target, {extending: true }));
				
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
					target[key] = mix;
					continue;
				}
				if ('node' === name) {
					// http://jsperf.com/indexof-vs-bunch-of-ifs
					var isSealed = key === 'renderStart'
							|| key === 'renderEnd'
							|| key === 'emitIn'
							|| key === 'emitOut'
							|| key === 'components'
							|| key === 'nodes'
							|| key === 'template'
							|| key === 'find'
							|| key === 'closest'
							|| key === 'on'
							|| key === 'remove'
							|| key === 'slotState'
							|| key === 'signalState'
							|| key === 'append'
							|| key === 'appendTo'
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
			if (imax === 1) {
				return fns[0];
			}
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
	}());
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
	// source ./ani.js
	var ani_requestFrame,
		ani_clearFrame,
		ani_updateAttr;
	
	(function(){
		ani_requestFrame = global.requestAnimationFrame;
		ani_clearFrame = global.cancelAnimationFrame;
	
		ani_updateAttr = function(compo, key, prop, val, meta) {
			var transition = compo.attr[key + '-transition'];
			if (transition == null && is_Object(meta)) {
				transition = meta.transition;
			}
			if (transition == null) {
				compo.attr[key] = val;
				if (prop != null) {
					compo[prop] = val;
				}
				_refresh(compo);
				return;
			}
			var tweens = compo.__tweens;
			if (tweens == null) {
				tweens = compo.__tweens = new TweenManager(compo);
			}
	
			var start = compo[prop];
			var end = val;
			tweens.start(key, prop, start, end, transition);
		};
	
	
		function _refresh(compo) {
			if (compo.onEnterFrame == null) {
				return;
			}
	
			if (compo.__frame != null) {
				ani_clearFrame(compo.__frame);
			}
			compo.__frame = ani_requestFrame(compo.onEnterFrame);
		}
	}());
	// end:source ./ani.js
	
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
	
		mask.registerAttrHandler('x-pipe-signal', 'client', function(node, attrValue, model, ctx, element, ctr) {
	
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
					log_error('Pipe-slot is invalid: {0} Usage e.g. "click: pipeName.pipeSignal"', x);
					return;
				}
	
				pipe = handler.substring(0, dot);
				signal = handler.substring(++dot);
	
				// if DEBUG
				!event && log_error('Pipe-slot is invalid. Event type is not set', attrValue);
				// endif
	
				dom_addEventListener(
					element
					, event
					, _createListener(pipe, signal)
				);
			}
		});
	
		function _createListener(pipe, signal) {
			return function(event){
				new Pipe(pipe).emit(signal, event);
			};
		}
	
	
		function pipe_attach(pipeName, ctr) {
			if (ctr.pipes[pipeName] == null) {
				log_error('Controller has no pipes to be added to collection', pipeName, ctr);
				return;
			}
	
			if (_collection[pipeName] == null) {
				_collection[pipeName] = [];
			}
			_collection[pipeName].push(ctr);
		}
	
		function pipe_detach(pipeName, ctr) {
			var pipe = _collection[pipeName],
				i = pipe.length;
	
			while (--i > -1) {
				if (pipe[i] === ctr) 
					pipe.splice(i, 1);
			}
	
		}
	
		function _removeController(ctr) {
			var	pipes = ctr.pipes;
			for (var key in pipes) {
				pipe_detach(key, ctr);
			}
		}
		function _removeControllerDelegate(ctr) {
			return function(){
				_removeController(ctr);
				ctr = null;
			};
		}
	
		function _addController(ctr) {
			var pipes = ctr.pipes;
			
			// if DEBUG
			if (pipes == null) {
				log_error('Controller has no pipes', ctr);
				return;
			}
			// endif
			
			for (var key in pipes) {
				pipe_attach(key, ctr);
			}
			Compo.attachDisposer(ctr, _removeControllerDelegate(ctr));
		}
		
		var Pipe = class_create({
			name: null,
			constructor: function Pipe (name) {
				if (this instanceof Pipe === false) {
					return new Pipe(name);
				}
				this.name = name;
				return this;
			},
			emit: function(signal){
				var controllers = _collection[this.name],
					name = this.name,
					args = _Array_slice.call(arguments, 1);
				
				if (controllers == null) {
					//if DEBUG
					log_warn('Pipe.emit: No signals were bound to:', name);
					//endif
					return;
				}
				
				var i = controllers.length,
					called = false;
	
				while (--i !== -1) {
					var ctr = controllers[i];
					var slots = ctr.pipes[name];
	
					if (slots == null) 
						continue;
					
					var slot = slots[signal];
					if (slot != null) {
						slot.apply(ctr, args);
						called = true;
					}
				}
	
				// if DEBUG
				if (called === false)
					log_warn('Pipe `%s` has not slots for `%s`', name, signal);
				// endif
			}
		});
		Pipe.addController = _addController;
		Pipe.removeController = _removeController;
	
		return {
			addController: _addController,
			removeController: _removeController,
			pipe: Pipe
		};
	
	}());
	
	// end:source /src/compo/pipes.js

	// source /src/tween/Tween.js
	var Tween;
	(function(){
		Tween = class_create({
			timing: null,
			duration: null,
			startedAt: null,
			start: null,
			diff: null,
			end: null,
			animating: null,
			constructor: function (key, prop, start, end, transition) {
				var parts = /(\d+m?s)\s*([\w\-]+)?/.exec(transition);
				this.duration = _toMs(parts[1], transition);
				this.timing = _toTimingFn(parts[2]);
				this.start = +start;
				this.end = +end;
				this.diff = this.end - this.start;
				this.key = key;
				this.prop = prop;
				this.animating = true;
			},
			tick: function(timestamp, parent) {
				if (this.startedAt == null) {
					this.startedAt = timestamp;
				}
				var d = timestamp - this.startedAt;
				var x = this.timing(d, this.start, this.diff, this.duration);
				if (d >= this.duration) {
					this.animating = false;
					x = this.end;
				}
				parent.attr[this.key] = x;
				if (this.prop) {
					parent[this.prop] = x;
				}
	
			},
		});
	
		/*2ms;3s*/
		function _toMs(str, easing) {
			if (str == null) {
				log_error('Easing: Invalid duration in ' + easing);
				return 0;
			}
			var d = parseFloat(str);
			if (str.indexOf('ms') > -1) {
				return d;
			}
			if (str.indexOf('s') > -1) {
				return d * 1000;
			}
			throw Error('Unsupported duration:' + str);
		}
	
		function _toTimingFn(str) {
			if (str == null) {
				return Fns.linear;
			}
			var fn = Fns[str];
			if (is_Function(fn) === false) {
				log_error('Unsupported timing:' + str + '. Available:' + Object.keys(Fns).join(','));
				return Fns.linear;
			}
			return fn;
		}
	
		// Easing functions by Robert Penner
	    // Source: http://www.robertpenner.com/easing/
	    // License: http://www.robertpenner.com/easing_terms_of_use.html
		var Fns = {
	        // t: is the current time (or position) of the tween.
	        // b: is the beginning value of the property.
	        // c: is the change between the beginning and destination value of the property.
	        // d: is the total time of the tween.
	        // jshint eqeqeq: false, -W041: true
			linear: function(t, b, c, d) {
				return c * t / d + b;
			},
	        linearEase: function(t, b, c, d) {
	            return c * t / d + b;
	        },
	        easeInQuad: function (t, b, c, d) {
	            return c*(t/=d)*t + b;
	        },
	        easeOutQuad: function (t, b, c, d) {
	            return -c *(t/=d)*(t-2) + b;
	        },
	        easeInOutQuad: function (t, b, c, d) {
	            if ((t/=d/2) < 1) return c/2*t*t + b;
	            return -c/2 * ((--t)*(t-2) - 1) + b;
	        },
	        easeInCubic: function (t, b, c, d) {
	            return c*(t/=d)*t*t + b;
	        },
	        easeOutCubic: function (t, b, c, d) {
	            return c*((t=t/d-1)*t*t + 1) + b;
	        },
	        easeInOutCubic: function (t, b, c, d) {
	            if ((t/=d/2) < 1) return c/2*t*t*t + b;
	            return c/2*((t-=2)*t*t + 2) + b;
	        },
	        easeInQuart: function (t, b, c, d) {
	            return c*(t/=d)*t*t*t + b;
	        },
	        easeOutQuart: function (t, b, c, d) {
	            return -c * ((t=t/d-1)*t*t*t - 1) + b;
	        },
	        easeInOutQuart: function (t, b, c, d) {
	            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
	            return -c/2 * ((t-=2)*t*t*t - 2) + b;
	        },
	        easeInQuint: function (t, b, c, d) {
	            return c*(t/=d)*t*t*t*t + b;
	        },
	        easeOutQuint: function (t, b, c, d) {
	            return c*((t=t/d-1)*t*t*t*t + 1) + b;
	        },
	        easeInOutQuint: function (t, b, c, d) {
	            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	            return c/2*((t-=2)*t*t*t*t + 2) + b;
	        },
	        easeInSine: function (t, b, c, d) {
	            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	        },
	        easeOutSine: function (t, b, c, d) {
	            return c * Math.sin(t/d * (Math.PI/2)) + b;
	        },
	        easeInOutSine: function (t, b, c, d) {
	            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	        },
	        easeInExpo: function (t, b, c, d) {
	            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	        },
	        easeOutExpo: function (t, b, c, d) {
	            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	        },
	        easeInOutExpo: function (t, b, c, d) {
	            if (t==0) return b;
	            if (t==d) return b+c;
	            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
	            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	        },
	        easeInCirc: function (t, b, c, d) {
	            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	        },
	        easeOutCirc: function (t, b, c, d) {
	            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	        },
	        easeInOutCirc: function (t, b, c, d) {
	            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
	            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	        },
	        easeInElastic: function (t, b, c, d) {
	            var s=1.70158;var p=0;var a=c;
	            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
	            if (a < Math.abs(c)) { a=c; s=p/4; }
	            else s = p/(2*Math.PI) * Math.asin (c/a);
	            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	        },
	        easeOutElastic: function (t, b, c, d) {
	            var s=1.70158;var p=0;var a=c;
	            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
	            if (a < Math.abs(c)) { a=c; s=p/4; }
	            else s = p/(2*Math.PI) * Math.asin (c/a);
	            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	        },
	        easeInOutElastic: function (t, b, c, d) {
	            // jshint eqeqeq: false, -W041: true
	            var s=1.70158;var p=0;var a=c;
	            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
	            if (a < Math.abs(c)) { a=c; s=p/4; }
	            else s = p/(2*Math.PI) * Math.asin (c/a);
	            if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	        },
	        easeInBack: function (t, b, c, d, s) {
	            // jshint eqeqeq: false, -W041: true
	            if (s == undefined) s = 1.70158;
	            return c*(t/=d)*t*((s+1)*t - s) + b;
	        },
	        easeOutBack: function (t, b, c, d, s) {
	            // jshint eqeqeq: false, -W041: true
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	        },
	        easeInOutBack: function (t, b, c, d, s) {
	            // jshint eqeqeq: false, -W041: true
	            if (s == undefined) s = 1.70158;
	            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	        },
	        easeInBounce: function (t, b, c, d) {
	            return c - Fns.easeOutBounce (d-t, 0, c, d) + b;
	        },
	        easeOutBounce: function (t, b, c, d) {
	            if ((t/=d) < (1/2.75)) {
	                return c*(7.5625*t*t) + b;
	            } else if (t < (2/2.75)) {
	                return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
	            } else if (t < (2.5/2.75)) {
	                return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
	            } else {
	                return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	            }
	        },
	        easeInOutBounce: function (t, b, c, d) {
	            if (t < d/2) return Fns.easeInBounce (t*2, 0, c, d) * 0.5 + b;
	            return Fns.easeOutBounce (t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	        }
	    };
	}());
	
	// end:source /src/tween/Tween.js
	// source /src/tween/TweenManager.js
	var TweenManager = class_create({
		animating: false,
		frame: null,
		constructor: function (compo) {
			this.parent = compo;
			this.tweens = {};
			this.tick = this.tick.bind(this);
			compo_attachDisposer(compo, this.dispose.bind(this));
		},
		start: function(key, prop, start, end, easing){
			// Tween is not disposable, as no resources are held. So if a tween already exists, it will be just overwritten.
			this.tweens[key] = new Tween(key, prop, start, end, easing);
			this.process();
		},
		process: function(){
			if (this.animating) {
				return;
			}
			this.animation = true;
			this.frame = ani_requestFrame(this.tick);
		},
		dispose: function(){
			ani_clearFrame(this.frame);
		},
		tick: function(timestamp){
			var busy = false;
			for (var key in this.tweens) {
				var tween = this.tweens[key];
				if (tween == null) {
					continue;
				}
				tween.tick(timestamp, this.parent);
				if (tween.animating === false) {
					this.tweens[key] = null;
					continue;
				}
				busy = true;
			}
			if (this.parent.onEnterFrame) {
				this.parent.onEnterFrame();
			}
			if (busy) {
				this.frame = ani_requestFrame(this.tick);
				return;
			}
			this.animating = false;
		}
	})
	// end:source /src/tween/TweenManager.js

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
			"escape": 27,
			
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
						if (x.length !== 1)  {
							throw Error('Unexpected sequence. Neither a predefined key, nor a char: ' + x);
						}
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
						if (r === Key_MATCH_OK) {
							event.preventDefault();
						}
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
					return;
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
				threshold_DIST = 10,
				timestamp_LastTouch = null;
			
			FastClick.prototype = {
				handleEvent: function (event) {
					var type = event.type;
					switch (type) {
						case 'touchmove':
						case 'touchstart':
						case 'touchend':
							timestamp_LastTouch = event.timeStamp;
							this[type](event);
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
					if (timestamp_LastTouch != null) {
						var dt = timestamp_LastTouch - event.timeStamp;
						if (dt < 500) {
							return;
						}
					}
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
				if (ctx != null) {
					if (ctx.defers == null) {
						// async components
						ctx.defers = [];
					}
					if (ctx.resolve == null) {
						obj_extend(ctx, class_Dfr.prototype);
					}
					ctx.async = true;
					ctx.defers.push(compo);
					ctx.defer();
				}
		
				obj_extend(compo, CompoProto);
				return function(){
					Compo.resume(compo, ctx);
				};
			};
			Compo.resume = function(compo, ctx){
				compo.async = false;
		
				// fn can be null when calling resume synced after pause
				if (compo.resume) {
					compo.resume();
				}
				if (ctx == null) {
					return;
				}
		
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
		
			Compo.await = function (compo) {
				return (new Awaiter).await(compo);
			}
		
			var CompoProto = {
				async: true,
				resume: null,
				await: function(resume, deep){
					if (deep === true) {
						Compo.await(this).then(resume);
						return;
					}
					if (this.async === false) {
						resume();
						return;
					}
					if (this.resume == null) {
						this.resume = resume;
						return;
					}
					var fn = this.resume;			
					this.resume = function(){
						fn.call(this);
						resume.call(this);
					};
				}
			};
		
			var Awaiter;
			(function(){
				Awaiter = class_create(class_Dfr, {
					isReady: false,
					count: 0,
					constructor: function(){
						this.dequeue = this.dequeue.bind(this);
					},
					enqueue: function(){
						this.count++;
					},
					dequeue: function(){
						if (--this.count === 0 && this.isReady === true) {
							this.resolve();
						}
					},
					await: function(compo) {
						awaitDeep(compo, this);
						if (this.count === 0) {
							this.resolve();
							return this;
						}
						this.isReady = true;
						return this;
					}
				});
				function awaitDeep(compo, awaiter){
					if (compo.async === true) {
						awaiter.enqueue();
						compo.await(awaiter.dequeue);
						return;
					}
					var arr = compo.components;
					if (arr == null)
						return;
		
					var imax = arr.length,
						i = -1;
					while(++i < imax) {
						awaitDeep(arr[i], awaiter);
					}
				}
			}());
		}());
		// end:source ./async.js
	
		CompoProto = {
			type: Dom.CONTROLLER,
			__resource: null,
			__frame: null,
			__tweens: null,
	
			ID: null,
	
			tagName: null,
			compoName: null,
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
				serializeNodes: null,
				handleAttributes: null,
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
				}
	
				ani_updateAttr(this, key, prop, val, meta);
				if (this.onAttributeSet) {
					this.onAttributeSet(key, val);
				}
			},
	
			onAttributeSet: null,
	
			onRenderStart: null,
			onRenderEnd: null,
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
			},
	
			$scope: function(path){
				var accessor = '$scope.' + path;
				return mask.Utils.Expression.eval(accessor, null, null, this);
			},
			$eval: function(expr, model_, ctx_){
				return mask.Utils.Expression.eval(expr, model_ || this.model, ctx_, this);
			},
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
			_fire = function (ctr, slot, sender, args_, direction) {
				if (ctr == null) {
					return false;
				}
				var found = false,
					args  = args_,
					fn = ctr.slots != null && ctr.slots[slot];
					
				if (typeof fn === 'string') {
					fn = ctr[fn];
				}
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
						if (is_ArrayLike(result)) {
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
						i = 0;
					for (; i < imax; i++) {
						found = _fire(compos[i], slot, sender, args, direction) || found;
					}
				}
				
				return found;
			} // _fire()
		
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
					if (attr != null) {
						signals = attr + signals;
					}
					el.setAttribute('data-signals', signals);
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
			next: function(selector){
				var x = this[0],
					dom = new DomLite;
				while (x != null && x.nextElementSibling != null) {
					x = x.nextElementSibling;
					if (selector == null) {
						return dom.add(x);
					}
					if (_is(x, selector)) {
						return dom.add(x);
					}
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
			},
			focus: function(){
				return each(this, function(x){
					x.focus && x.focus();
				});
			}
		};
		
		(function(){
			each(['show', 'hide'], function(method) {
				Proto[method] = function(){
					return each(this, function(x){
						x.style.display = method === 'hide' ? 'none' : '';
					});
				};
			});
		}());
		
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
