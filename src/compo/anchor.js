
/**
 *	Get component that owns an element
 **/

var Anchor = (function(){

	var _cache = {};

	return {
		create: function(compo){
			if (compo.ID == null){
				console.warn('Component should have an ID');
				return;
			}

			_cache[compo.ID] = compo;
		},
		resolveCompo: function(element){
			if (element == null){
				return null;
			}
			do {

				var id = element.getAttribute('x-compo-id');
				if (id != null){
					var compo = _cache[id];
					if (compo == null){
						compo = this.resolveCompo(element.parentNode);
						if (compo != null){
							compo = Compo.find(compo, {
								key: 'ID',
								selector: id,
								nextKey: 'components'
							});
						}
					}
					if (compo == null){
						console.warn('No controller for ID', id);
					}

					return compo;
				}

				element = element.parentNode;

			}while(element && element.nodeType === 1);

			return null;
		},
		removeCompo: function(compo){
			if (compo.ID == null){
				return;
			}
			delete _cache[compo.ID];
		}
	};

}());
