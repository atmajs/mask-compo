function find_findSingle(node, matcher) {
	if (node instanceof Array) {
		for (var i = 0, x, length = node.length; i < length; i++) {
			x = node[i];
			var r = find_findSingle(x, matcher);
			if (r != null) {
				return r;
			}
		}
		return null;
	}

	if (selector_match(node, matcher) === true) {
		return node;
	}
	return (node = node[matcher.nextKey]) && find_findSingle(node, matcher);
}
