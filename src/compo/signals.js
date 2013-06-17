(function() {

	/**
	 *	Mask Custom Attribute
	 *	Bind Closest Controller Handler Function to dom event(s)
	 */

	mask.registerAttrHandler('x-signal', function(node, attrValue, model, cntx, element, controller) {

		var arr = attrValue.split(';'),
			signals = '';
		for (var i = 0, x, length = arr.length; i < length; i++) {
			x = arr[i].trim();
			if (x === '') {
				continue;
			}

			var event = x.substring(0, x.indexOf(':')),
				handler = x.substring(x.indexOf(':') + 1).trim(),
				Handler = _createListener(controller, handler);


			// if DEBUG
			!event && console.error('Signal: event type is not set', attrValue);
			// endif

			if (Handler) {

				if (EventDecorator != null) {
					event = EventDecorator(event);
				}

				signals += ',' + handler + ',';
				dom_addEventListener(element, event, Handler);
			}

			// if DEBUG
			!Handler && console.warn('No slot found for signal', handler, controller);
			// endif
		}

		if (signals !== '') {
			element.setAttribute('data-signals', signals);
		}

	});

	// @param sender - event if sent from DOM Event or CONTROLLER instance
	function _fire(controller, slot, sender, args, direction) {
		
		if (controller == null) {
			return false;
		}
		
		var found = false;

		if (controller.slots != null && typeof controller.slots[slot] === 'function') {
			found = true;
			
			var fn = controller.slots[slot],
				isDisabled = controller.slots.__disabled != null && controller.slots.__disabled[slot];

			if (isDisabled !== true) {

				var result = args == null ? fn.call(controller, sender) : fn.apply(controller, [sender].concat(args));

				if (result === false) {
					return true;
				}
			}
		}

		if (direction === -1 && controller.parent != null) {
			return _fire(controller.parent, slot, sender, args, direction) || found;
		}

		if (direction === 1 && controller.components != null) {
			var compos = controller.components,
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

	function _hasSlot(controller, slot, direction, isActive) {
		if (controller == null) {
			return false;
		}

		var slots = controller.slots;

		if (slots != null && slots[slot] != null) {
			if (typeof slots[slot] === 'string') {
				slots[slot] = controller[slots[slot]];
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

		if (direction === -1 && controller.parent != null) {
			return _hasSlot(controller.parent, slot, direction);
		}

		if (direction === 1 && controller.components != null) {
			for (var i = 0, length = controller.components.length; i < length; i++) {
				if (_hasSlot(controller.components[i], slot, direction)) {
					return true;
				}

			}
		}
		return false;
	}

	function _createListener(controller, slot) {

		if (_hasSlot(controller, slot, -1) === false) {
			return null;
		}

		return function(event) {
			_fire(controller, slot, event, null, -1);
		};
	}

	function __toggle_slotState(controller, slot, isActive) {
		var slots = controller.slots;
		if (slots == null || slots.hasOwnProperty(slot) === false) {
			return;
		}

		if (slots.__disabled == null) {
			slots.__disabled = {};
		}

		slots.__disabled[slot] = isActive === false;
	}

	function __toggle_slotStateWithChilds(controller, slot, isActive) {
		__toggle_slotState(controller, slot, isActive);

		if (controller.components != null) {
			for (var i = 0, length = controller.components.length; i < length; i++) {
				__toggle_slotStateWithChilds(controller.components[i], slot, isActive);
			}
		}
	}

	function __toggle_elementsState(controller, slot, isActive) {
		if (controller.$ == null) {
			console.warn('Controller has no elements to toggle state');
			return;
		}

		domLib() //
		.add(controller.$.filter('[data-signals]')) //
		.add(controller.$.find('[data-signals]')) //
		.each(function(index, node) {
			var signals = node.getAttribute('data-signals');

			if (signals != null && signals.indexOf(slot) !== -1) {
				node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
			}
		});
	}

	function _toggle_all(controller, slot, isActive) {

		var parent = controller,
			previous = controller;
		while ((parent = parent.parent) != null) {
			__toggle_slotState(parent, slot, isActive);

			if (parent.$ == null || parent.$.length === 0) {
				// we track previous for changing elements :disable state
				continue;
			}

			previous = parent;
		}

		__toggle_slotStateWithChilds(controller, slot, isActive);
		__toggle_elementsState(previous, slot, isActive);

	}

	function _toggle_single(controller, slot, isActive) {
		__toggle_slotState(controller, slot, isActive);

		if (!isActive && (_hasSlot(controller, slot, -1, true) || _hasSlot(controller, slot, 1, true))) {
			// there are some active slots; do not disable elements;
			return;
		}
		__toggle_elementsState(controller, slot, isActive);
	}



	obj_extend(Compo, {
		signal: {
			toggle: _toggle_all,

			// to parent
			emitOut: function(controller, slot, sender, args) {
				var captured = _fire(controller, slot, sender, args, -1);
				
				// if DEBUG
				!captured && console.warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
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
					console.error('Slot not found', slot, controller);
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
