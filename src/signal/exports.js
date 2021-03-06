(function(){
	
	// import ./utils.js
	// import ./toggle.js
	// import ./attributes.js
	// import ./compound.js
	
	obj_extend(Compo, {
		signal: {
			toggle: _toggle_all,
			// to parent
			emitOut: function(ctr, slot, sender, args) {
				var captured = _fire(ctr, slot, sender, args, -1);				
				// if DEBUG
				!captured && log_warn('Signal', slot, 'was not captured');
				// endif
			},
			// to children
			emitIn: function(ctr, slot, sender, args) {
				_fire(ctr, slot, sender, args, 1);
			},
			enable: function(ctr, slot) {
				_toggle_all(ctr, slot, true);
			},			
			disable: function(ctr, slot) {
				_toggle_all(ctr, slot, false);
			}
		},
		slot: {
			toggle: _toggle_single,
			enable: function(ctr, slot) {
				_toggle_single(ctr, slot, true);
			},
			disable: function(ctr, slot) {
				_toggle_single(ctr, slot, false);
			},
			invoke: function(ctr, slot, event, args) {
				var slots = ctr.slots;
				if (slots == null || typeof slots[slot] !== 'function') {
					log_error('Slot not found', slot, ctr);
					return null;
				}
				if (args == null) {
					return slots[slot].call(ctr, event);
				}
				return slots[slot].apply(ctr, [event].concat(args));
			},
			attach: _compound
		}

	});
	
}());