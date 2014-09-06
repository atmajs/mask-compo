/*
 * Extrem simple Dom Library. If (jQuery | Kimbo | Zepto) is not used.
 * Only methods, required for the Compo library are implemented.
 */
var DomLite;
(function(){
	Compo.DomLite = DomLite = function(els){
		if (this instanceof DomLite === false) 
			return new DomLite(els);
		
		return this.add(els)
	};
	
	if (domLib == null && global.document != null) 
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
	
	var doc = global.document.documentElement;
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
}());