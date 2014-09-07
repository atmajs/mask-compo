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
	
	DomLite.prototype = DomLite.fn = {
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
		}
	};
	
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
	
	var doc = document.documentElement;
	var _$$ = doc.querySelectorAll;
	var _is = (function(){
		var matchesSelector =
			doc.webkitMatchesSelector ||
			doc.mozMatchesSelector ||
			doc.msMatchesSelector ||
			doc.oMatchesSelector ||
			doc.matchesSelector
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
				var el = event.target;
				while(el != null){
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
		var _addEvent = doc.addEventListener,
			_remEvent = doc.removeEventListener;
	}());
	
	/* class handler */
	each(['add', 'remove', 'toggle', 'has'], function(method){
		var isHasClass = 'has' === method,
			isClassListSupported = doc.classList != null,
			Fn;
		
		var hasClass = isClassListSupported === true
			? function (node, klass) {
				return -1 !== _Array_indexOf.call(node.classList, klass);
			}
			: function(node, klass) {
				return -1 !== (' ' + node.className + ' ').indexOf(' ' + klass + ' ');
			};
		if (isHasClass) {
			Fn = function(klass){
				return -1 !== indexOf(this, function(node){
					return hasClass(node, klass);
				});
			}
		}
		else {
			var mutator = isClassListSupported === true
				? function(node, klass){
					var classList = node.classList;
					classList[method].call(classList, klass);
				}
				: (function(){
					function add(node, klass){
						node.className += ' ' + klass;
					}
					function remove(node, klass){
						node.className = (' ' + node.className + ' ').replace(' ' + klass + ' ', ' ');
					}
					return function(node, klass){
						var has = hasClass(node, klass)
						if ('add' === method) {
							if (false === has) 
								add(node, klass);
							return;
						}
						if ('remove' === method) {
							if (true === method) 
								remove(node, klass);
							return;
						}
						var fn = has ? remove : add;
						fn(node, klass);
					}
				}());
			Fn = function(klass){
				return each(this, function(node){
					mutator(node, klass);
				});
			};
		}
		
		DomLite.prototype[method + 'Class'] = Fn;
	})
	
}(global.document));