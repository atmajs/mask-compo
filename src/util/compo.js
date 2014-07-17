var compo_dispose,
	compo_detachChild,
	compo_ensureTemplate,
	compo_ensureAttributes,
	compo_attachDisposer,
	compo_createConstructor,
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
	
		var compos = compo.components,
			i = (compos && compos.length) || 0;
	
		while ( --i > -1 ) {
			compo_dispose(compos[i]);
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
		if (compo.nodes != null) 
			return;
		
		// obsolete
		if (compo.attr.template != null) {
			compo.template = compo.attr.template;
			
			delete compo.attr.template;
		}
		
		var template = compo.template;
		if (template == null) 
			return;
		
		if (is_String(template)) {
			if (template.charCodeAt(0) === 35 && /^#[\w\d_-]+$/.test(template)) {
				// #
				var node = document.getElementById(template.substring(1));
				if (node == null) {
					log_error('<compo> Template holder not found by id:', template);
					return;
				}
				template = node.innerHTML;
			}
			
			template = mask.parse(template);
		}
	
		if (typeof template === 'object') 
			compo.nodes = template;
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
	
		
	
	compo_createConstructor = function(Ctor, proto) {
		var compos = proto.compos,
			pipes = proto.pipes,
			attr = proto.attr;
			
		if (compos == null
			&& pipes == null
			&& proto.attr == null) {
			
			return Ctor;
		}
	
		/* extend compos / attr to keep
		 * original prototyped values untouched
		 */
		return function CompoBase(){
	
			if (compos != null) {
				// use this.compos instead of compos from upper scope
				// : in case compos from proto was extended after
				this.compos = obj_copy(this.compos);
			}
	
			if (pipes != null) 
				Pipes.addController(this);
			
			if (attr != null) 
				this.attr = obj_copy(this.attr);
			
			
			Ctor.call(this);
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
			if (Proto.meta == null) 
				Proto.meta = {};
			
			var metas = Proto.meta.attributes,
				fn = null;
			if (metas) {
				var hash = {};
				for(var key in metas) {
					_handleProperty_Delegate(Proto, key, metas[key], hash);
				}
				fn = _handleAll_Delegate(hash);
			}
			Proto.meta.handleAttributes = fn;
		};
		compo_meta_executeAttributeHandler = function(compo){
			var fn = compo.meta && compo.meta.handleAttributes;
			return fn == null ? true : fn(compo);
		};
		
		function _handleAll_Delegate(hash){
			return function(compo){
				var attr = compo.attr,
					key, fn, val, error;
				for(key in hash){
					fn    = hash[key];
					val   = attr[key];
					error = fn(compo, val);
					
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
			hash [attrName] = function(compo, attrVal){
				if (attrVal == null) 
					return optional ? null : Error('Expected');
				
				var val = fn.call(compo, attrVal, compo);
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
			'boolean': function(x){
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
	
}());
