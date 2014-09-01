var dfr_isBusy;
(function(){
	dfr_isBusy = function(dfr){
		if (dfr == null || typeof dfr.then !== 'function') 
			return false;
		
		// Class.Deferred
		if (is_Function(dfr.isBusy)) 
			return dfr.isBusy();
		
		// jQuery Deferred
		if (is_Function(dfr.state)) 
			return dfr.state() === 'pending';
		
		log_warn('Class or jQuery deferred interface expected');
		return false;
	};
}());