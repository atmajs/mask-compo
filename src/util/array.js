
var arr_each,
	arr_remove
	;

(function(){

	arr_each = function(array, fn){
		var imax = array.length,
			i = -1;
		while ( ++i < imax ){
			fn(array[i], i);
		}
	};
	
	arr_remove = function(array, child){
		if (array == null){
			console.error('Can not remove myself from parent', child);
			return;
		}
	
		var index = array.indexOf(child);
	
		if (index === -1){
			console.error('Can not remove myself from parent', child, index);
			return;
		}
	
		array.splice(index, 1);
	};
	
	
}());
