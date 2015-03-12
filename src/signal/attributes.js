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