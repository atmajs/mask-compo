
function arr_each(array, fn){
	for(var i = 0, length = array.length; i < length; i++){
		fn(array[i], i);
	}
}

function arr_remove(array, child){
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
}
