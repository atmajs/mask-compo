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
	
	var threshold_TIME = 300,
		threshold_DIST = 10;
	
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