var Pipes = (function() {


	mask.registerAttrHandler('x-pipe-signal', function(node, attrValue, model, cntx, element, controller) {

		var arr = attrValue.split(';');
		for (var i = 0, x, length = arr.length; i < length; i++) {
			x = arr[i].trim();
			if (x === '') {
				continue;
			}

			var event = x.substring(0, x.indexOf(':')),
				handler = x.substring(x.indexOf(':') + 1).trim(),
				dot = handler.indexOf('.'),
				pipe, signal;

			if (dot === -1) {
				console.error('define pipeName "click: pipeName.pipeSignal"');
				return;
			}

			pipe = handler.substring(0, dot);
			signal = handler.substring(++dot);

			var Handler = _handler(pipe, signal);


			// if DEBUG
			!event && console.error('Signal: event type is not set', attrValue);
			// endif


			if (EventDecorator != null) {
				event = EventDecorator(event);
			}

			dom_addEventListener(element, event, Handler);

		}
	});

	function _handler(pipe, signal) {
		return function(){
			new Pipe(pipe).emit(signal);
		};
	}

	var Collection = {};


	function pipe_attach(pipeName, controller) {
		if (controller.pipes[pipeName] == null) {
			console.error('Controller has no pipes to be added to collection', pipeName, controller);
			return;
		}

		if (Collection[pipeName] == null) {
			Collection[pipeName] = [];
		}
		Collection[pipeName].push(controller);
	}

	function pipe_detach(pipeName, controller) {
		var pipe = Collection[pipeName],
			i = pipe.length;

		while (--i) {
			if (pipe[i] === controller) {
				pipe.splice(i, 1);
				i++;
			}
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
			console.error('Controller has no pipes', controller);
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
		emit: function(signal, args){
			var controllers = Collection[this.pipeName],
				pipeName = this.pipeName;
			if (controllers == null) {
				console.warn('Pipe.emit: No signals were bound to a Pipe', pipeName);
				return;
			}

			var i = controllers.length,
				controller, slots, slot, called;

			while (--i !== -1) {
				controller = controllers[i];
				slots = controller.pipes[pipeName];

				if (slots == null) {
					continue;
				}

				slot = slots[signal];
				if (typeof slot === 'function') {
					slot.apply(controller, args);
					called = true;
				}
			}

			// if DEBUG
			called !== true && console.warn('No piped slot found for a signal', signal, pipeName);
			// endif
		}
	};

	Pipe.addController = controller_add;
	Pipe.removeController = controller_remove;

	return {
		addController: controller_add,
		removeController: controller_remove,

		emit: function(pipeName, signal, args) {
			Pipe(pipeName).emit(signal, args);
		},
		pipe: Pipe
	};

}());
