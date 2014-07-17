(function(){
	
	function _on(ctx, type, callback) {
		if (ctx[type] == null)
			ctx[type] = [];
		
		ctx[type].push(callback);
		
		return ctx;
	}
	
	function _call(ctx, type, _arguments) {
		var cbs = ctx[type];
		if (cbs == null) 
			return;
		
		for (var i = 0, x, imax = cbs.length; i < imax; i++){
			x = cbs[i];
			if (x == null)
				continue;
			
			cbs[i] = null;
			
			if (_arguments == null) {
				x();
				continue;
			}
			
			x.apply(this, _arguments);
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
			this.async = false;
			_call(this, '_cbs_done', arguments);
			_call(this, '_cbs_always', arguments);
		},
		reject: function(){
			this.async = false;
			_call(this, '_cbs_fail', arguments);
			_call(this, '_cbs_always');
		},
		_cbs_done: null,
		_cbs_fail: null,
		_cbs_always: null
	};
	
	var CompoProto = {
		async: true,
		await: function(resume){
			this.resume = resume;
		}
	};
	
	Compo.pause = function(compo, ctx){
		if (ctx.async == null) {
			ctx.defers = [];
			obj_extend(ctx, DeferProto);
		}
		
		ctx.async = true;
		ctx.defers.push(compo);
		
		obj_extend(compo, CompoProto);
		
		return function(){
			Compo.resume(compo, ctx);
		};
	};
	
	Compo.resume = function(compo, ctx){
		
		// fn can be null when calling resume synced after pause
		if (compo.resume) 
			compo.resume();
		
		compo.async = false;
		
		var busy = false,
			dfrs = ctx.defers,
			imax = dfrs.length,
			i = -1,
			x;
		while ( ++i < imax ){
			x = dfrs[i];
			
			if (x === compo) {
				dfrs[i] = null;
				continue;
			}
			busy = busy || x != null;
		}
		if (busy === false) 
			ctx.resolve();
	};
	
}());