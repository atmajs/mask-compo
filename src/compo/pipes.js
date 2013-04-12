var Pipes = (function() {

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

	return {
		addController: controller_add,
		removeController: controller_remove,

		emit: function(pipeName, signal, args) {
			Pipe(pipeName).emit(signal, args);
		},
		pipe: Pipe
	};

}());
