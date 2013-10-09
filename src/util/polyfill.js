if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(x){
		for (var i = 0, imax = this.length; i < imax; i++){
			if (this[i] === x)
				return i;
		}
		
		return -1;
	}
}