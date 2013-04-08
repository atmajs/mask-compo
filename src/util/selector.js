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
			selector = new RegExp('\\b' + selector.substring(1) + '\\b');
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

	if (selector.selector.test != null) {
		if (selector.selector.test(obj[selector.key])) {
			return true;
		}
	} else {
		if (obj[selector.key] === selector.selector) {
			return true;
		}
	}

	return false;
}
