// try to initialize the dom lib, or is then called from `setDOMLibrary`
domLib_initialize();

function domLib_initialize(){
	if (domLib == null || domLib.fn == null)
		return;
	
	domLib.fn.compo = function(selector){
		if (this.length === 0)
			return null;
		
		var compo = Anchor.resolveCompo(this[0]);

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
		arr_each([
			'appendMask',
			'prependMask',
			'beforeMask',
			'afterMask'
		], function(method, index){
			
			domLib.fn[method] = function(template, model, controller, ctx){
				
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
				
				if (controller == null) {
					controller = index < 2
						? this.compo()
						: this.parent().compo()
						;
				}
				
				if (controller == null) {
					controller = {};
					// if DEBUG
					log_warn(
						'$.***Mask - controller not found, this can lead to memory leaks if template contains compos'
					);
					// endif
				}
				
				
				if (controller.components == null) {
					controller.components = [];
				}
				
				var compos = controller.components,
					i = compos.length,
					fragment = mask.render(template, model, ctx, null, controller);
				
				var self = this[jQ_Methods[index]](fragment),
					imax = compos.length;
				
				for (; i < imax; i++) {
					Compo.signal.emitIn(compos[i], 'domInsert');
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
