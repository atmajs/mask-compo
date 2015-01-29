(function(){
	
	// import ./utils.js
	// import ./toggle.js
	// import ./attributes.js
	
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