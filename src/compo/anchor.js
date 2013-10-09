
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

			var findID, currentID, compo;
			do {

				currentID = element.getAttribute('x-compo-id');


				if (currentID) {

					if (findID == null) {
						findID = currentID;
					}

					compo = _cache[currentID];

					if (compo != null) {
						compo = Compo.find(compo, {
							key: 'ID',
							selector: findID,
							nextKey: 'components'
						});

						if (compo != null) {
							return compo;
						}
					}

				}

				element = element.parentNode;

			}while(element && element.nodeType === 1);


			// if DEBUG
			findID && console.warn('No controller for ID', findID);
			// endif
			return null;
		},
		removeCompo: function(compo){
			if (compo.ID == null){
				return;
			}
			delete _cache[compo.ID];
		},
		getByID: function(id){
			return _cache[id];
		}
	};

}());
