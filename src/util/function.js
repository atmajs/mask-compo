var fn_proxy,
	fn_apply
	;

(function(){

	fn_proxy = function(fn, ctx) {
	
		return function() {
			return fn_apply(fn, ctx, arguments);
		};
	};
	
	fn_apply = function(fn, ctx, arguments_){
		
		switch (arguments_.length) {
			case 0:
				return fn.call(ctx);
			case 1:
				return fn.call(ctx, arguments_[0]);
			case 2:
				return fn.call(ctx,
					arguments_[0],
					arguments_[1]);
			case 3:
				return fn.call(ctx,
					arguments_[0],
					arguments_[1],
					arguments_[2]);
			case 4:
				return fn.call(ctx,
					arguments_[0],
					arguments_[1],
					arguments_[2],
					arguments_[3]);
		};
		
		return fn.apply(ctx, arguments_);
	};
	
}());
