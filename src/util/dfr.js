var dfr_isBusy;
(function(){
	dfr_isBusy = function(dfr){
		if (dfr == null || typeof dfr.then !== 'function') 
			return false;
		
		// Class.Deferred support, @todo Promise|jQuery dfr etc.
		return this._resolved != null || this._rejected != null;
	};
}());