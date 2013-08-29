function selector_parse(selector, type, direction) {
	if (selector == null){
		console.warn('selector is null for type', type);
	}

	if (typeof selector === 'object'){
		return selector;
	}

	var key, prop, nextKey;

	if (key == null) {
		switch (selector[0]) {
		case '#':
			key = 'id';
			selector = selector.substring(1);
			prop = 'attr';
			break;
		case '.':
			key = 'class';
			selector = sel_hasClassDelegate(selector.substring(1));
			prop = 'attr';
			break;
		default:
			key = type === Dom.SET ? 'tagName' : 'compoName';
			break;
		}
	}

	if (direction === 'up') {
		nextKey = 'parent';
	} else {
		nextKey = type === Dom.SET ? 'nodes' : 'components';
	}

	return {
		key: key,
		prop: prop,
		selector: selector,
		nextKey: nextKey
	};
}

function selector_match(node, selector, type) {
	if (typeof selector === 'string') {
		if (type == null) {
			type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
		}
		selector = selector_parse(selector, type);
	}

	var obj = selector.prop ? node[selector.prop] : node;
	if (obj == null) {
		return false;
	}

	if (typeof selector.selector === 'function') {
		return selector.selector(obj[selector.key]);
	}
	
	if (selector.selector.test != null) {
		if (selector.selector.test(obj[selector.key])) {
			return true;
		}
	}
	
	else {
		// == - to match int and string
		if (obj[selector.key] == selector.selector) {
			return true;
		}
	}

	return false;
}



function sel_hasClassDelegate(matchClass) {
	return function(className){
		return sel_hasClass(className, matchClass);
	};
}

// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
function sel_hasClass(className, matchClass, index) {
	if (typeof className !== 'string')
		return false;
	
	if (index == null) 
		index = 0;
		
	index = className.indexOf(matchClass, index);

	if (index === -1)
		return false;

	if (index > 0 && className.charCodeAt(index - 1) > 32)
		return sel_hasClass(className, matchClass, index + 1);

	var class_Length = className.length,
		match_Length = matchClass.length;
		
	if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
		return sel_hasClass(className, matchClass, index + 1);

	return true;
}
