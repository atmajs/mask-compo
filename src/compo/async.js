(function(){
	
	function _on(cntx, type, callback) {
		if (this[type] == null)
			this[type] = [];
		
		this[type].push(callback);
		
		return cntx;
	}
	
	function _call(cntx, type) {
		var cbs = cntx[type];
		if (cbs == null) 
			return;
		
		for (var i = 0, x, imax = cbs.length; i < imax; i++){
			x = cbs[i];
			if (x == null)
				continue;
			
			cbs[i] = null;
			
			x();
		}
	}
	
	
	var DeferProto = {
		done: function(callback){
			return _on(this, '_cbs_done', callback);
		},
		fail: function(callback){
			return _on(this, '_cbs_fail', callback);
		},
		always: function(callback){
			return _on(this, '_cbs_always', callback);
		},
		resolve: function(){
			_call(this, '_cbs_done');
			_call(this, '_cbs_always');
		},
		reject: function(error){
			_call(this, '_cbs_fail', error);
			_call(this, '_cbs_always');
		}
	};
	
	var CompoProto = {
		async: true,
		await: function(resume){
			this.resume = resume;
		}
	}
	
	Compo.pause = function(compo, cntx){
		
		if (cntx.async == null) {
			cntx.async = true;
			cntx.defers = [];
			
			cntx._cbs_done = null;
			cntx._cbs_fail = null;
			cntx._cbs_always = null;
			
			for (var key in DeferProto) {
				cntx[key] = DeferProto[key];
			}
		}
		
		for (var key in CompoProto) {
			compo[key] = CompoProto[key];
		}
		
		cntx.defers.push(compo);
	}
	
	Compo.resume = function(compo, cntx){
		
		compo.resume();
		
		var busy = false;
		for (var i = 0, x, imax = cntx.defers.length; i < imax; i++){
			x = cntx.defers[i];
			
			if (x === compo) {
				cntx.defers[i] = null;
			}
			
			if (busy === false) {
				busy = x != null;
			}
		}
		
		if (busy === false) {
			cntx.resolve();
		}
	};
	
}());