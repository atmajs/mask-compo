var Events_ = {
		on: function(component, events, $element) {
			if ($element == null) {
				$element = component.$;
			}

			var isarray = events instanceof Array,
				length = isarray ? events.length : 1;

			for (var i = 0, x; isarray ? i < length : i < 1; i++) {
				x = isarray ? events[i] : events;

				if (x instanceof Array) {
					// generic jQuery .on Arguments

					if (EventDecorator != null) {
						x[0] = EventDecorator(x[0]);
					}

					$element.on.apply($element, x);
					continue;
				}


				for (var key in x) {
					var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
						parts = key.split(':'),
						type = parts[0] || 'click';

					if (EventDecorator != null) {
						type = EventDecorator(type);
					}

					$element.on(type, parts.splice(1).join(':').trim() || null, fn.bind(component));
				}
			}
		}
	},
	EventDecorator = null;
