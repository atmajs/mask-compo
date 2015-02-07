(function(){
	Compo.pause = function(compo, ctx){
		if (ctx.defers == null) 
			ctx.defers = [];
		
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
	
	var CompoProto = {
		async: true,
		await: function(resume){
			this.resume = resume;
		}
	};
}());