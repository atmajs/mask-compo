function is_Function(x) {
	return typeof x === 'function';
}

function is_Object(x) {
	return x != null
		&& typeof x === 'object';
}

function is_Array(x) {
	return arr != null
		&& typeof arr === 'object'
		&& typeof arr.length === 'number'
		&& typeof arr.splice === 'function'
		;
}

function is_String(x) {
	return typeof x === 'string';
}

function is_notEmptyString(x) {
	return typeof x === 'string'
		&& x !== '';
}

function is_rawObject(obj) {
	if (obj == null) 
		return false;
	
	if (typeof obj !== 'object')
		return false;
	
	return obj.constructor === Object;
}
