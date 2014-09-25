var Pipes = (function() {
	
	var _collection = {};

	mask.registerAttrHandler('x-pipe-signal', 'client', function(node, attrValue, model, cntx, element, controller) {

		var arr = attrValue.split(';'),
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
				dot = handler.indexOf('.'),
				
				pipe, signal;

			if (dot === -1) {
				log_error('define pipeName "click: pipeName.pipeSignal"');
				return;
			}

			pipe = handler.substring(0, dot);
			signal = handler.substring(++dot);

			var Handler = _handler(pipe, signal);


			// if DEBUG
			!event && log_error('Signal: event type is not set', attrValue);
			// endif


			dom_addEventListener(element, event, Handler);

		}
	});

	function _handler(pipe, signal) {
		return function(event){
			new Pipe(pipe).emit(signal, event);
		};
	}


	function pipe_attach(pipeName, controller) {
		if (controller.pipes[pipeName] == null) {
			log_error('Controller has no pipes to be added to collection', pipeName, controller);
			return;
		}

		if (_collection[pipeName] == null) {
			_collection[pipeName] = [];
		}
		_collection[pipeName].push(controller);
	}

	function pipe_detach(pipeName, controller) {
		var pipe = _collection[pipeName],
			i = pipe.length;

		while (--i > -1) {
			if (pipe[i] === controller) 
				pipe.splice(i, 1);
		}

	}

	function controller_remove() {
		var	controller = this,
			pipes = controller.pipes;
		for (var key in pipes) {
			pipe_detach(key, controller);
		}
	}

	function controller_add(controller) {
		var pipes = controller.pipes;

		// if DEBUG
		if (pipes == null) {
			log_error('Controller has no pipes', controller);
			return;
		}
		// endif

		for (var key in pipes) {
			pipe_attach(key, controller);
		}

		Compo.attachDisposer(controller, controller_remove.bind(controller));
	}

	function Pipe(pipeName) {
		if (this instanceof Pipe === false) {
			return new Pipe(pipeName);
		}
		this.pipeName = pipeName;

		return this;
	}
	Pipe.prototype = {
		constructor: Pipe,
		emit: function(signal){
			var controllers = _collection[this.pipeName],
				pipeName = this.pipeName,
				args;
			
			if (controllers == null) {
				//if DEBUG
				log_warn('Pipe.emit: No signals were bound to:', pipeName);
				//endif
				return;
			}
			
			/**
			 * @TODO - for backward comp. support
			 * to pass array of arguments as an Array in second args
			 *
			 * - switch to use plain arguments
			 */
			
			if (arguments.length === 2 && is_Array(arguments[1])) 
				args = arguments[1];
				
			else if (arguments.length > 1) 
				args = _Array_slice.call(arguments, 1);
			
			
			var i = controllers.length,
				controller, slots, slot, called;

			while (--i !== -1) {
				controller = controllers[i];
				slots = controller.pipes[pipeName];

				if (slots == null) 
					continue;
				
				slot = slots[signal];
				if (is_Function(slot)) {
					slot.apply(controller, args);
					called = true;
				}
			}

			// if DEBUG
			if (!called)
				log_warn('Pipe `%s` has not slots for `%s`', pipeName, signal);
			// endif
		}
	};

	Pipe.addController = controller_add;
	Pipe.removeController = controller_remove;

	return {
		addController: controller_add,
		removeController: controller_remove,

		pipe: Pipe
	};

}());
