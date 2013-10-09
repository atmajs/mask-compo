(function(){

	if (domLib == null || domLib.fn == null){
		return;
	}


	domLib.fn.compo = function(selector){
		if (this.length === 0){
			return null;
		}
		var compo = Anchor.resolveCompo(this[0]);

		if (selector == null){
			return compo;
		}

		return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
	};

	domLib.fn.model = function(selector){
		var compo = this.compo(selector);
		if (compo == null){
			return null;
		}
		var model = compo.model;
		while(model == null && compo.parent){
			compo = compo.parent;
			model = compo.model;
		}
		return model;
	};
	
	
	(function(){
		
		var jQ_Methods = [
			'append',
			'prepend',
			'insertAfter',
			'insertBefore'
		];
		
		arr_each([
			'appendMask',
			'prependMask',
			'insertMaskBefore',
			'insertMaskAfter'
		], function(method, index){
			
			domLib.fn[method] = function(template, model, controller, ctx){
				
				if (controller == null) {
					
					controller = index < 2
						? this.compo()
						: this.parent().compo()
						;
				}
				
				// if DEBUG
				controller == null && console.warn(
					'$.***Mask - controller not found, this can lead to memory leaks if template contains compos'
				);
				// endif
				
				var fragment = mask.render(template, model, ctx, null, controller);
				
				this[jQ_Methods[index]](fragment);
			};
			
		});
	}());
	
	

}());
