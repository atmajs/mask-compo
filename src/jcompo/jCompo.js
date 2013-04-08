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

}());
