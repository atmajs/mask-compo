var TouchHandler;
(function(){
	TouchHandler = {
		supports: function (type) {
			if (isTouchable === false) {
				return false;
			}
			switch(type){
				case 'click':
				case 'mousedown':
				case 'mouseup':
				case 'mousemove':
					return true;
			}
			return false;
		},
		on: function(el, type, fn){
			if ('click' === type) {
				return new FastClick(el, fn);
			}
			return new Touch(el, type, fn);
		}
	};
	
	
	function event_bind(el, type, mix){
		el.addEventListener(type, mix, false);
	}
	function event_unbind(el, type, mix) {
		el.removeEventListener(type, mix, false);
	}
	function event_trigger(el, type) {
		var event = new CustomEvent(type, {
			cancelable: true,
			bubbles: true
		});
		el.dispatchEvent(event);
	}
	
	var threshold_TIME = 300,
		threshold_DIST = 10;
	
	
	var isTouchable;
	(function(){
		isTouchable = 'ontouchstart' in global;
	}());
	
	var Touch;
	(function(){
		Touch = function(el, type, fn) {
			this.el = el;
			this.fn = fn;
			this.dismiss = 0;
			event_bind(el, type, this);
			event_bind(el, MOUSE_MAP[type], this);
		};
		
		var MOUSE_MAP = {
			'mousemove': 'touchmove',
			'mousedown': 'touchstart',
			'mouseup': 'touchend'
		};
		var TOUCH_MAP = {
			'touchmove': 'mousemove',
			'touchstart': 'mousedown',
			'touchup': 'mouseup'
		};
		
		Touch.prototype = {
			handleEvent: function (event) {
				switch(event.type){
					case 'touchstart':
					case 'touchmove':
					case 'touchend':
						this.dismiss++;
						event = prepairTouchEvent(event);
						this.fn(event);
						break;
					case 'mousedown':
					case 'mousemove':
					case 'mouseup':
						if (--this.dismiss < 0) {
							this.dismiss = 0;
							this.fn(event);
						}
						break;
				}
			}
		};
		function prepairTouchEvent(event){
			var touch = null,
				touches = event.changedTouches;
			if (touches && touches.length) {
				touch = touches[0];
			}
			if (touch == null && event.touches) {
				touch = event.touches[0];
			}
			if (touch == null) {
				return event;
			}
			return createMouseEvent(event, touch);
		}
		function createMouseEvent (event, touch) {
			var obj = Object.create(MouseEvent.prototype);
			for (var key in event) {
				obj[key] = event[key];
			}
			for (var key in PROPS) {
				obj[key] = touch[key];
			}
			return new MouseEvent(TOUCH_MAP[event.type], obj);
		}
		var PROPS = {
			clientX: 1,
			clientY: 1,
			pageX: 1,
			pageY: 1,
			screenX: 1,
			screenY: 1
		};
	}());
	
	var FastClick;
	(function(){
		FastClick = function (el, fn) {
			this.state = 0;
			this.el = el;
			this.fn = fn;
			this.startX = 0;
			this.startY = 0;
			this.tStart = 0;
			this.tEnd = 0;
			this.dismiss = 0;
			
			event_bind(el, 'touchstart', this);
			event_bind(el, 'touchend', this);
			event_bind(el, 'click', this);
		};
		FastClick.prototype = {
			handleEvent: function (event) {
				switch (event.type) {
					case 'touchmove':
						this.touchmove(event);
						break;
					case 'touchstart':
						this.touchstart(event);
						break;
					case 'touchend':
						this.touchend(event);
						break;
					case 'touchcancel':
						this.reset();
						break;
					case 'click':
						this.click(event);
						break;
				}
			},
			
			touchstart: function(event){
				event_bind(document.body, 'touchmove', this);
				
				var e = event.touches[0];
				
				this.state  = 1;
				this.tStart = event.timeStamp;
				this.startX = e.clientX;
				this.startY = e.clientY;
			},
			touchend: function (event) {
				this.tEnd = event.timeStamp;
				if (this.state === 1) {
					this.dismiss++;
					if (this.tEnd - this.tStart <= threshold_TIME) {
						this.call(event);
						return;
					}
					
					event_trigger(this.el, 'taphold');
					return;
				}
				this.reset();
			},
			click: function(event){
				if (--this.dismiss > -1) 
					return;
				
				var dt = event.timeStamp - this.tEnd;
				if (dt < 400) 
					return;
				
				this.dismiss = 0;
				this.call(event);
			},
			touchmove: function(event) {
				var e = event.touches[0];
				
				var dx = e.clientX - this.startX;
				if (dx < 0) dx *= -1;
				if (dx > threshold_DIST) {
					this.reset();
					return;
				}
				
				var dy = e.clientY - this.startY;
				if (dy < 0) dy *= -1;
				if (dy > threshold_DIST) {
					this.reset();
					return;
				}
			},
			
			reset: function(){
				this.state = 0;
				event_unbind(document.body, 'touchmove', this);
			},
			call: function(event){
				this.reset();
				this.fn(event);
			}
		};
		
	}());
	
}());