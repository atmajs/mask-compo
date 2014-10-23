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
	
		var compos = compo.components,
			i = compos == null ? 0 : compos.length;
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
		if (compo.nodes == null) {
			compo.nodes = getTemplateProp_(compo);
			return;
		}
		var behaviour = compo.meta.template;
		if (behaviour == null || behaviour === 'replace') {
			return;
		}
		var template = getTemplateProp_(compo);
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
