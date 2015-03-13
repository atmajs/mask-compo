(function(){
	Compo.pause = function(compo, ctx){
		if (ctx != null) {
			if (ctx.defers == null) {
				// async components
				ctx.defers = [];
			}
			if (ctx.resolve == null) {
				obj_extend(ctx, class_Dfr.prototype);
			}
			ctx.async = true;
			ctx.defers.push(compo);
		}
		
		obj_extend(compo, CompoProto);
		return function(){
			Compo.resume(compo, ctx);
		};
	};
	Compo.resume = function(compo, ctx){
		compo.async = false;

		// fn can be null when calling resume synced after pause
		if (compo.resume) {
			compo.resume();
		}
		if (ctx == null) {
			return;
		}
		
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