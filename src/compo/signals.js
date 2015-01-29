(function() {
	/**
	 *	Mask Custom Attribute
	 *	Bind Closest Controller Handler Function to dom event(s)
	 */
	mask.registerAttrHandler(
		'x-signal'
		, 'client'
		, function(node, attrValue, model, ctx, el, ctr) {

		var arr = attrValue.split(';'),
			signals = '',
			imax = arr.length,
			i = -1,
			x;
		
		while ( ++i < imax ) {
			x = arr[i].trim();
			if (x === '') 
				continue;
			
			var i_colon = x.indexOf(':'),
				event = x.substring(0, i_colon),
				handler = x.substring(i_colon + 1).trim(),
				Handler = _createListener(ctr, handler),
				i_param = event.indexOf('('),
				param
				;
			if (i_param !== -1) {
				param = event.substring(i_param + 1, event.lastIndexOf(')'));
				event = event.substring(0, i_param);
				
				// if DEBUG
				param === '' && log_error('Not valid signal parameter');
				// endif
			}
			// if DEBUG
			!event && log_error('Signal: Event is not set', attrValue);
			// endif

			if (Handler) {

				signals += ',' + handler + ',';
				dom_addEventListener(el, event, Handler, param, ctr);
			}

			// if DEBUG
			!Handler && log_warn('Slot not found:', handler);
			// endif
		}
		
		if (signals !== '') 
			el.setAttribute('data-signals', signals);
	});
	
	_createAttr('click');
	_createAttr('change');
	_createAttr('keypress');
	_createAttr('keydown');
	_createAttr('keyup');
	_createAttr('mousedown');
	_createAttr('mouseup');
	_createAttr('tap', 'click');
	function _createAttr (type, event) {
		mask.registerAttrHandler('x-' + type
			, 'client'
			, _addSignalDelegate(event || type)
		);
	}
	
	function _addSignalDelegate(type) {
		return function(node, attrValue, model, ctx, el, ctr){
			_bind(el, type, attrValue.trim(), ctr);
		};
	}
	function _bind(el, event, handler, ctr) {
		var Handler = _createListener(ctr, handler);
		if (Handler == null) {
			log_warn('No slot found for signal', handler, ctr);
			return;
		}
		dom_addEventListener(el, event, Handler);
	}
	
	// @param sender - event if sent from DOM Event or CONTROLLER instance
	function _fire(ctr, slot, sender, args, direction) {
		if (ctr == null) 
			return false;
		
		var found = false,
			fn = ctr.slots != null && ctr.slots[slot];
			
		if (typeof fn === 'string') 
			fn = ctr[fn];
		
		if (typeof fn === 'function') {
			found = true;
			
			var isDisabled = ctr.slots.__disabled != null && ctr.slots.__disabled[slot];
			if (isDisabled !== true) {

				var result = args == null
					? fn.call(ctr, sender)
					: fn.apply(ctr, [ sender ].concat(args));

				if (result === false) {
					return true;
				}
				if (result != null && typeof result === 'object' && result.length != null) {
					args = result;
				}
			}
		}

		if (direction === -1 && ctr.parent != null) {
			return _fire(ctr.parent, slot, sender, args, direction) || found;
		}

		if (direction === 1 && ctr.components != null) {
			var compos = ctr.components,
				imax = compos.length,
				i = 0,
				r;
			for (; i < imax; i++) {
				r = _fire(compos[i], slot, sender, args, direction);
				
				!found && (found = r);
			}
		}
		
		return found;
	}

	function _hasSlot(ctr, slot, direction, isActive) {
		if (ctr == null) {
			return false;
		}
		var slots = ctr.slots;
		if (slots != null && slots[slot] != null) {
			if (typeof slots[slot] === 'string') {
				slots[slot] = ctr[slots[slot]];
			}
			if (typeof slots[slot] === 'function') {
				if (isActive === true) {
					if (slots.__disabled == null || slots.__disabled[slot] !== true) {
						return true;
					}
				} else {
					return true;
				}
			}
		}
		if (direction === -1 && ctr.parent != null) {
			return _hasSlot(ctr.parent, slot, direction);
		}
		if (direction === 1 && ctr.components != null) {
			for (var i = 0, length = ctr.components.length; i < length; i++) {
				if (_hasSlot(ctr.components[i], slot, direction)) {
					return true;
				}
			}
		}
		return false;
	}

	function _createListener(ctr, slot) {
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

	function __toggle_slotState(ctr, slot, isActive) {
		var slots = ctr.slots;
		if (slots == null || slots.hasOwnProperty(slot) === false) {
			return;
		}
		var disabled = slots.__disabled;
		if (disabled == null) {
			disabled = slots.__disabled = {};
		}
		disabled[slot] = isActive === false;
	}

	function __toggle_slotStateWithChilds(ctr, slot, isActive) {
		__toggle_slotState(ctr, slot, isActive);
		
		var compos = ctr.components;
		if (compos != null) {
			var imax = compos.length,
				i = 0;
			for(; i < imax; i++) {
				__toggle_slotStateWithChilds(compos[i], slot, isActive);
			}
		}
	}

	function __toggle_elementsState(ctr, slot, isActive) {
		if (ctr.$ == null) {
			log_warn('Controller has no elements to toggle state');
			return;
		}

		domLib() 
			.add(ctr.$.filter('[data-signals]')) 
			.add(ctr.$.find('[data-signals]')) 
			.each(function(index, node) {
				var signals = node.getAttribute('data-signals');
	
				if (signals != null && signals.indexOf(slot) !== -1) {
					node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
				}
			});
	}

	function _toggle_all(ctr, slot, isActive) {

		var parent = ctr,
			previous = ctr;
		while ((parent = parent.parent) != null) {
			__toggle_slotState(parent, slot, isActive);

			if (parent.$ == null || parent.$.length === 0) {
				// we track previous for changing elements :disable state
				continue;
			}

			previous = parent;
		}

		__toggle_slotStateWithChilds(ctr, slot, isActive);
		__toggle_elementsState(previous, slot, isActive);

	}

	function _toggle_single(ctr, slot, isActive) {
		__toggle_slotState(ctr, slot, isActive);

		if (!isActive && (_hasSlot(ctr, slot, -1, true) || _hasSlot(ctr, slot, 1, true))) {
			// there are some active slots; do not disable elements;
			return;
		}
		__toggle_elementsState(ctr, slot, isActive);
	}



	obj_extend(Compo, {
		signal: {
			toggle: _toggle_all,

			// to parent
			emitOut: function(controller, slot, sender, args) {
				var captured = _fire(controller, slot, sender, args, -1);
				
				// if DEBUG
				!captured && log_warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
				// endif
				
			},
			// to children
			emitIn: function(controller, slot, sender, args) {
				_fire(controller, slot, sender, args, 1);
			},

			enable: function(controller, slot) {
				_toggle_all(controller, slot, true);
			},
			
			disable: function(controller, slot) {
				_toggle_all(controller, slot, false);
			}
		},
		slot: {
			toggle: _toggle_single,
			enable: function(controller, slot) {
				_toggle_single(controller, slot, true);
			},
			disable: function(controller, slot) {
				_toggle_single(controller, slot, false);
			},
			invoke: function(controller, slot, event, args) {
				var slots = controller.slots;
				if (slots == null || typeof slots[slot] !== 'function') {
					log_error('Slot not found', slot, controller);
					return null;
				}

				if (args == null) {
					return slots[slot].call(controller, event);
				}

				return slots[slot].apply(controller, [event].concat(args));
			},

		}

	});

}());
